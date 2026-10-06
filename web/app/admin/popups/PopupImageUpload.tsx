"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

export function PopupImageUpload({ popupId, imageUrl }: { popupId: string; imageUrl?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("file");
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
    if (!file) return setStatus("Choose an image to upload.");
    if (file.size > MAX_IMAGE_SIZE) return setStatus("Images must be 15 MB or smaller.");

    setPending(true);
    setStatus("Uploading…");
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch(`/api/admin/popups/${popupId}/image`, { method: "POST", body });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) return setStatus(result.error ?? "The upload failed.");
      setStatus("Image uploaded.");
      form.reset();
      router.refresh();
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex max-w-3xl flex-col gap-4 rounded-2xl border border-border-default bg-white p-5 sm:p-6">
      <div>
        <h2 className="font-serif text-xl font-medium">Image</h2>
        <p className="text-sm text-text-secondary">JPEG, PNG, WebP or GIF up to 15 MB. Animated GIF/WebP files animate in the popup.</p>
      </div>
      {imageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element -- remote R2 URL; may be animated */
        <img src={imageUrl} alt="Current popup" className="max-h-64 w-auto max-w-full self-start rounded-xl border border-border-default object-contain" />
      )}
      <form onSubmit={upload} className="flex flex-wrap items-center gap-3">
        <input
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required
          className="text-sm file:mr-3 file:h-9 file:cursor-pointer file:rounded-lg file:border file:border-border-input file:bg-white file:px-3 file:text-sm file:font-semibold"
        />
        <button type="submit" disabled={pending} className="h-10 rounded-[10px] border border-brand-green px-4 text-sm font-semibold text-brand-green disabled:opacity-60">
          {pending ? "Uploading…" : imageUrl ? "Replace image" : "Upload image"}
        </button>
        {status && <span role="status" className="text-sm text-text-secondary">{status}</span>}
      </form>
    </section>
  );
}
