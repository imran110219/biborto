import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { galleryAlbums, galleryPhotos } from "@/drizzle/schema";
import { requireAdminMemberId } from "@/lib/auth/require-admin";
import { getR2BucketName, getR2Client, getR2PublicUrl } from "@/lib/r2";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_CAPTION_LENGTH = 250;

const imageTypes = [
  { mimeType: "image/jpeg", extension: "jpg" },
  { mimeType: "image/png", extension: "png" },
  { mimeType: "image/webp", extension: "webp" },
  { mimeType: "image/gif", extension: "gif" },
] as const;

function detectImageType(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return imageTypes[0];
  if (bytes.length >= 8 && bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10") return imageTypes[1];
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return imageTypes[2];
  const gifHeader = bytes.length >= 6 ? String.fromCharCode(...bytes.slice(0, 6)) : "";
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") return imageTypes[3];
  return undefined;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let uploaderId: string;
  try {
    uploaderId = await requireAdminMemberId();
  } catch {
    return errorResponse("Only admins and superadmins can upload gallery images.", 403);
  }

  let client;
  let bucketName: string;
  try {
    client = getR2Client();
    bucketName = getR2BucketName();
    // Validate the public URL before any object is uploaded, so a bad
    // display configuration can't leave an unreachable image in storage.
    getR2PublicUrl("configuration-check");
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "R2 is not configured.", 503);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Send one image as multipart form data.", 400);
  }

  const albumId = String(formData.get("albumId") ?? "");
  const rawCaption = String(formData.get("caption") ?? "").trim();
  const file = formData.get("file");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(albumId)) {
    return errorResponse("Choose a valid gallery album.", 400);
  }
  if (!(file instanceof File)) return errorResponse("Choose an image to upload.", 400);
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) return errorResponse("Images must be 15 MB or smaller.", 413);
  if (rawCaption.length > MAX_CAPTION_LENGTH) return errorResponse("Captions must be 250 characters or fewer.", 400);

  const [album] = await db
    .select({ id: galleryAlbums.id, slug: galleryAlbums.slug })
    .from(galleryAlbums)
    .where(eq(galleryAlbums.id, albumId))
    .limit(1);
  if (!album) return errorResponse("That gallery album does not exist.", 404);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const imageType = detectImageType(bytes);
  if (!imageType) return errorResponse("Upload a valid JPEG, PNG, WebP, or GIF image.", 415);

  const key = `gallery/${album.id}/${randomUUID()}.${imageType.extension}`;
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
    console.error("Gallery image upload to R2 failed.", error);
    return errorResponse("The image could not be uploaded. Check the R2 settings and try again.", 500);
  }

  let photoId: string;
  try {
    const [photo] = await db
      .insert(galleryPhotos)
      .values({
        albumId: album.id,
        r2Key: key,
        caption: rawCaption || null,
        uploadedBy: uploaderId,
      })
      .returning({ id: galleryPhotos.id });
    if (!photo) throw new Error("The gallery photo record was not returned.");
    photoId = photo.id;
  } catch (error) {
    try {
      await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
    } catch {
      // Keep the original error; a rare cleanup failure can be handled
      // from Cloudflare's bucket UI using the gallery/<album-id>/ prefix.
    }
    console.error("Gallery photo record creation failed.", error);
    return errorResponse("The image could not be saved. Please try again.", 500);
  }

  revalidatePath("/gallery");
  revalidatePath(`/gallery/${album.slug}`);
  revalidatePath("/admin/photos");
  return NextResponse.json({ id: photoId, imageUrl: getR2PublicUrl(key) }, { status: 201 });
}
