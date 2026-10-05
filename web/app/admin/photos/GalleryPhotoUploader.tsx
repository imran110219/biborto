"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { GalleryAlbum } from "@/lib/db/queries/gallery";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

export function GalleryPhotoUploader({ albums }: { albums: GalleryAlbum[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const albumId = String(formData.get("albumId") ?? "");
    const caption = String(formData.get("caption") ?? "");
    const input = form.elements.namedItem("files");
    const files = input instanceof HTMLInputElement ? Array.from(input.files ?? []) : [];

    if (!albumId || files.length === 0) {
      setStatus("Choose an album and at least one image.");
      return;
    }

    setPending(true);
    setStatus(`Uploading ${files.length} image${files.length === 1 ? "" : "s"}…`);
    let uploaded = 0;
    const failures: string[] = [];

    for (const [index, file] of files.entries()) {
      if (file.size > MAX_IMAGE_SIZE) {
        failures.push(`${file.name}: larger than 15 MB`);
        continue;
      }

      const body = new FormData();
      body.set("albumId", albumId);
      body.set("caption", caption);
      body.set("file", file);

      try {
        setStatus(`Uploading ${index + 1} of ${files.length}: ${file.name}`);
        const response = await fetch("/api/admin/gallery/photos", { method: "POST", body });
        const result = await response.json() as { error?: string };
        if (!response.ok) {
          failures.push(`${file.name}: ${result.error ?? "upload failed"}`);
          continue;
        }
        uploaded += 1;
      } catch {
        failures.push(`${file.name}: network error`);
      }
    }

    form.reset();
    setPending(false);
    if (failures.length) {
      setStatus(`Uploaded ${uploaded} of ${files.length}. ${failures.join("; ")}`);
    } else {
      setStatus(`Uploaded ${uploaded} image${uploaded === 1 ? "" : "s"}.`);
    }
    if (uploaded) router.refresh();
  }

  if (albums.length === 0) {
    return <p className="text-sm text-text-secondary">No albums yet — a superadmin needs to create one before images can be uploaded.</p>;
  }

  return (
    <form onSubmit={upload} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Album
          <select name="albumId" required className="h-12 rounded-xl border border-border-input bg-white px-3 font-normal">
            {albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Images
          <input
            name="files"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            required
            className="min-h-12 rounded-xl border border-border-input bg-white px-3 py-2 font-normal file:mr-3 file:rounded-full file:border-0 file:bg-[#EDE8DC] file:px-3 file:py-1.5 file:text-sm file:font-semibold"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Caption (optional, applied to each selected image)
        <input name="caption" maxLength={250} className="h-12 rounded-xl border border-border-input bg-white px-3 font-normal" />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 items-center justify-center rounded-full bg-brand-green px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Uploading…" : "Upload images"}
        </button>
        <span aria-live="polite" className="text-sm text-text-secondary">{status}</span>
      </div>
      <p className="text-xs text-text-secondary">JPEG, PNG, WebP or GIF. Maximum 15 MB per image.</p>
    </form>
  );
}
