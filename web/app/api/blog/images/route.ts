import { randomUUID } from "node:crypto";
import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { members } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { consume } from "@/lib/security/rate-limit";
import { LIMITS } from "@/lib/security/limits";
import { detectImageType } from "@/lib/images";
import { MAX_BLOG_IMAGE_SIZE, MAX_BLOG_IMAGES_PER_MEMBER } from "@/lib/blog/limits";
import { getR2BucketName, getR2Client, getR2PublicUrl } from "@/lib/r2";

export const runtime = "nodejs";

const errorResponse = (message: string, status: number) => NextResponse.json({ error: message }, { status });

// Image upload for the blog editor (body pictures and cover photos). Any active
// member may upload — members write posts too — but only into their own folder
// (blog/<their id>/…), with a per-member cap; admins aren't capped.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Sign in to upload images.", 401);

  const [member] = await db
    .select({ id: members.id, status: members.status, role: members.platformRole })
    .from(members)
    .where(eq(members.userId, session.user.id))
    .limit(1);
  if (member?.status !== "active") return errorResponse("Your membership isn't active.", 403);
  const isAdmin = member.role === "admin" || member.role === "superadmin";

  // Checked before the (up to 8 MB) body is read.
  const limit = await consume(`blog-image:member:${member.id}`, LIMITS.blogImageUpload);
  if (!limit.allowed) {
    return NextResponse.json({ error: "You're uploading images too quickly. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }

  let client;
  let bucketName: string;
  try {
    client = getR2Client();
    bucketName = getR2BucketName();
    getR2PublicUrl("configuration-check");
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "R2 is not configured.", 503);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Send an image as multipart form data.", 400);
  }
  const file = formData.get("file");
  if (!(file instanceof File)) return errorResponse("Choose an image to upload.", 400);
  if (file.size <= 0 || file.size > MAX_BLOG_IMAGE_SIZE) return errorResponse("Images must be 8 MB or smaller.", 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const imageType = detectImageType(bytes);
  if (!imageType) return errorResponse("Upload a valid JPEG, PNG, WebP, or GIF image.", 415);

  const prefix = `blog/${member.id}/`;
  const store = async (): Promise<NextResponse> => {
    if (!isAdmin) {
      try {
        const listed = await client.send(new ListObjectsV2Command({ Bucket: bucketName, Prefix: prefix, MaxKeys: MAX_BLOG_IMAGES_PER_MEMBER }));
        if ((listed.KeyCount ?? 0) >= MAX_BLOG_IMAGES_PER_MEMBER) {
          return errorResponse(`You've reached the limit of ${MAX_BLOG_IMAGES_PER_MEMBER} blog images.`, 429);
        }
      } catch (error) {
        console.error("Blog image quota check failed.", error);
        return errorResponse("The image could not be uploaded right now. Please try again.", 500);
      }
    }

    const key = `${prefix}${randomUUID()}.${imageType.extension}`;
    try {
      await client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: bytes,
        ContentLength: bytes.byteLength,
        ContentType: imageType.mimeType,
        CacheControl: "public, max-age=31536000, immutable",
      }));
    } catch (error) {
      console.error("Blog image upload to R2 failed.", error);
      return errorResponse("The image could not be uploaded. Check the R2 settings and try again.", 500);
    }

    return NextResponse.json({ key, url: getR2PublicUrl(key) }, { status: 201 });
  };

  // The quota is "count what's in R2, then add one", so two parallel uploads could both pass
  // the check. Members are serialized behind a per-member advisory lock (admins aren't capped).
  if (isAdmin) return store();
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`blog-image:${member.id}`}))`);
    return store();
  });
}
