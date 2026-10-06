import { MAX_BLOG_IMAGE_SIZE } from "@/lib/blog/limits";

// Browser-side helper for the blog editor: uploads one image to
// /api/blog/images and returns its R2 key (what posts store as a cover) and
// public URL (what goes into the Markdown body).
export async function uploadBlogImage(file: File): Promise<{ key: string; url: string }> {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) throw new Error("Choose a JPEG, PNG, WebP or GIF image.");
  if (file.size > MAX_BLOG_IMAGE_SIZE) throw new Error("Images must be 8 MB or smaller.");

  const body = new FormData();
  body.set("file", file);
  let response: Response;
  try {
    response = await fetch("/api/blog/images", { method: "POST", body });
  } catch {
    throw new Error("Network error. Please try again.");
  }
  const result = (await response.json().catch(() => ({}))) as { key?: string; url?: string; error?: string };
  if (!response.ok || !result.key || !result.url) throw new Error(result.error ?? "The upload failed.");
  return { key: result.key, url: result.url };
}
