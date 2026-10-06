// Magic-byte image sniffing shared by upload routes that accept JPEG, PNG,
// WebP or GIF. The client's filename and Content-Type are never trusted.
export const IMAGE_TYPES = [
  { mimeType: "image/jpeg", extension: "jpg" },
  { mimeType: "image/png", extension: "png" },
  { mimeType: "image/webp", extension: "webp" },
  { mimeType: "image/gif", extension: "gif" },
] as const;

export function detectImageType(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return IMAGE_TYPES[0];
  if (bytes.length >= 8 && bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10") return IMAGE_TYPES[1];
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return IMAGE_TYPES[2];
  const gifHeader = bytes.length >= 6 ? String.fromCharCode(...bytes.slice(0, 6)) : "";
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") return IMAGE_TYPES[3];
  return undefined;
}
