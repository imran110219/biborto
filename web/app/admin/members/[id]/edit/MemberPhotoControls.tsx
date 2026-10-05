"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

function PhotoUpload({
  memberId,
  photoType,
  label,
  imageUrl,
}: {
  memberId: string;
  photoType: "avatar" | "cover";
  label: string;
  imageUrl?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("file");
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
    if (!file) {
      setStatus("Choose an image to upload.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setStatus("Images must be 15 MB or smaller.");
      return;
    }

    setPending(true);
    setStatus("Uploading…");
    const body = new FormData();
    body.set("photoType", photoType);
    body.set("file", file);
    try {
      const response = await fetch(`/api/admin/members/${memberId}/photos`, { method: "POST", body });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setStatus(result.error ?? "The upload failed.");
        return;
      }
      setStatus(`${label} uploaded.`);
      form.reset();
      router.refresh();
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={upload} className="flex flex-col gap-3 rounded-xl border border-border-default p-4">
      <span className="text-sm font-semibold">{label}</span>
      {imageUrl && (
        <div role="img" aria-label={`Current ${label.toLowerCase()}`} className="h-28 w-full rounded-lg bg-cover bg-center" style={{ backgroundImage: `url("${imageUrl}")` }} />
      )}
      <input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="text-sm" />
      <span className="text-xs text-text-secondary">JPEG, PNG, WebP, or GIF · up to 15 MB</span>
      <button type="submit" disabled={pending} className="h-10 rounded-[10px] bg-brand-green px-4 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Uploading…" : imageUrl ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
      </button>
      {status && <p role="status" className="text-sm text-text-secondary">{status}</p>}
    </form>
  );
}

export function MemberPhotoControls({
  memberId,
  avatarUrl,
  coverPhotoUrl,
}: {
  memberId: string;
  avatarUrl?: string;
  coverPhotoUrl?: string;
}) {
  return (
    <section className="max-w-2xl rounded-2xl border border-border-default bg-white p-6">
      <h2 className="mb-4 font-serif text-2xl font-medium">Member photos</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <PhotoUpload memberId={memberId} photoType="avatar" label="Profile photo" imageUrl={avatarUrl} />
        <PhotoUpload memberId={memberId} photoType="cover" label="Cover photo" imageUrl={coverPhotoUrl} />
      </div>
    </section>
  );
}
