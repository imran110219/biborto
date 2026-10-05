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

  const isAvatar = photoType === "avatar";
  return (
    <form onSubmit={upload} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          role="img"
          aria-label={imageUrl ? `Current ${label.toLowerCase()}` : `No ${label.toLowerCase()}`}
          className={`flex shrink-0 items-center justify-center bg-brand-green-tint bg-cover bg-center text-xs text-brand-green ${
            isAvatar ? "h-16 w-16 rounded-full" : "h-16 w-28 rounded-lg"
          }`}
          style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}
        >
          {!imageUrl && "None"}
        </div>
        <div className="min-w-0">
          <span className="block text-sm font-semibold">{label}</span>
          <span className="text-xs text-text-secondary">JPEG, PNG, WebP or GIF · up to 15 MB</span>
        </div>
      </div>
      <input
        name="file"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        required
        className="w-full text-sm file:mr-3 file:h-9 file:cursor-pointer file:rounded-lg file:border file:border-border-input file:bg-white file:px-3 file:text-sm file:font-semibold"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-[10px] border border-brand-green px-4 text-sm font-semibold text-brand-green disabled:opacity-60"
      >
        {pending ? "Uploading…" : imageUrl ? "Replace photo" : "Upload photo"}
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
    <section className="flex flex-col gap-5 rounded-2xl border border-border-default bg-white p-5 sm:p-6">
      <h2 className="font-serif text-xl font-medium">Photos</h2>
      <PhotoUpload memberId={memberId} photoType="avatar" label="Profile photo" imageUrl={avatarUrl} />
      <div className="h-px bg-border-default" />
      <PhotoUpload memberId={memberId} photoType="cover" label="Cover photo" imageUrl={coverPhotoUrl} />
    </section>
  );
}
