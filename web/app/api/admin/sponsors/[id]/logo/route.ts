import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { sponsors } from "@/drizzle/schema";
import { requireSuperadmin } from "@/lib/auth/require-admin";
import { getR2BucketName, getR2Client, getR2PublicUrl } from "@/lib/r2";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const imageTypes = [
  { mimeType: "image/jpeg", extension: "jpg" },
  { mimeType: "image/png", extension: "png" },
  { mimeType: "image/webp", extension: "webp" },
  { mimeType: "image/gif", extension: "gif" },
] as const;

// Sniffs the file's magic bytes rather than trusting the client's filename or
// content type. Animated GIF/WebP/APNG pass through untouched and animate.
function detectImageType(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return imageTypes[0];
  if (bytes.length >= 8 && bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10") return imageTypes[1];
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return imageTypes[2];
  const gifHeader = bytes.length >= 6 ? String.fromCharCode(...bytes.slice(0, 6)) : "";
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") return imageTypes[3];
  return undefined;
}

const errorResponse = (message: string, status: number) => NextResponse.json({ error: message }, { status });

export async function POST(request: Request, { params }: RouteContext<"/api/admin/sponsors/[id]/logo">) {
  try {
    await requireSuperadmin();
  } catch {
    return errorResponse("Only a superadmin can upload sponsor logos.", 403);
  }

  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return errorResponse("Choose a valid sponsor.", 400);
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
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) return errorResponse("Images must be 15 MB or smaller.", 413);

  const [sponsor] = await db.select({ id: sponsors.id, logoKey: sponsors.logoKey }).from(sponsors).where(eq(sponsors.id, id)).limit(1);
  if (!sponsor) return errorResponse("That sponsor does not exist.", 404);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const imageType = detectImageType(bytes);
  if (!imageType) return errorResponse("Upload a valid JPEG, PNG, WebP, or GIF image.", 415);

  const key = `sponsors/${id}/${randomUUID()}.${imageType.extension}`;
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
    console.error("Sponsor logo upload to R2 failed.", error);
    return errorResponse("The image could not be uploaded. Check the R2 settings and try again.", 500);
  }

  try {
    await db.update(sponsors).set({ logoKey: key }).where(eq(sponsors.id, id));
  } catch (error) {
    try { await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key })); } catch { /* best effort cleanup */ }
    console.error("Sponsor logo record update failed.", error);
    return errorResponse("The image could not be saved. Please try again.", 500);
  }

  if (sponsor.logoKey) {
    try { await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: sponsor.logoKey })); }
    catch (error) { console.error("Previous sponsor logo cleanup failed.", error); }
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin/sponsors");
  revalidatePath(`/admin/sponsors/${id}/edit`);
  return NextResponse.json({ logoUrl: getR2PublicUrl(key) }, { status: 201 });
}

export async function DELETE(_request: Request, { params }: RouteContext<"/api/admin/sponsors/[id]/logo">) {
  try {
    await requireSuperadmin();
  } catch {
    return errorResponse("Only a superadmin can remove sponsor logos.", 403);
  }

  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return errorResponse("Choose a valid sponsor.", 400);
  }
  const [sponsor] = await db.select({ logoKey: sponsors.logoKey }).from(sponsors).where(eq(sponsors.id, id)).limit(1);
  if (!sponsor) return errorResponse("That sponsor does not exist.", 404);

  await db.update(sponsors).set({ logoKey: null }).where(eq(sponsors.id, id));
  if (sponsor.logoKey) {
    try {
      await getR2Client().send(new DeleteObjectCommand({ Bucket: getR2BucketName(), Key: sponsor.logoKey }));
    } catch (error) {
      console.error("Sponsor logo cleanup failed.", error);
    }
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin/sponsors");
  revalidatePath(`/admin/sponsors/${id}/edit`);
  return NextResponse.json({ ok: true });
}
