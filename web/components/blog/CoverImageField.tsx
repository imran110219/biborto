"use client";

import { useRef, useState } from "react";
import { uploadBlogImage } from "@/lib/blog/upload-client";

// Cover photo picker for a post. Uploads straight to R2 through
// /api/blog/images and keeps the stored key in a hidden `coverKey` input, which
// the save/submit action validates (a member may only attach their own uploads).
export function CoverImageField({
  initialKey = "",
  initialUrl,
  onChange,
}: {
  initialKey?: string;
  initialUrl?: string;
  onChange?: (url: string | undefined) => void;
}) {
  const [key, setKey] = useState(initialKey);
  const [url, setUrl] = useState(initialUrl);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const input = useRef<HTMLInputElement>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setPending(true);
    setError(undefined);
    try {
      const uploaded = await uploadBlogImage(file);
      setKey(uploaded.key);
      setUrl(uploaded.url);
      onChange?.(uploaded.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The upload failed.");
    } finally {
      setPending(false);
    }
  }

  function remove() {
    setKey("");
    setUrl(undefined);
    onChange?.(undefined);
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="coverKey" value={key} />
      {url ? (
        <div className="relative overflow-hidden rounded-2xl border border-border-default">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote R2 URL */}
          <img src={url} alt="Cover" className="h-48 w-full object-cover" />
          <div className="absolute right-3 top-3 flex gap-2">
            <button type="button" onClick={() => input.current?.click()} disabled={pending} className="h-9 rounded-lg bg-white/95 px-3 text-sm font-semibold shadow disabled:opacity-60">
              {pending ? "Uploading…" : "Replace"}
            </button>
            <button type="button" onClick={remove} disabled={pending} className="h-9 rounded-lg bg-white/95 px-3 text-sm font-semibold text-[#9C3D10] shadow disabled:opacity-60">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={pending}
          className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-border-default bg-bg-admin py-9 text-center disabled:opacity-60"
        >
          <span className="font-semibold">{pending ? "Uploading…" : "Add a cover photo"}</span>
          <span className="text-sm text-text-secondary">JPEG, PNG, WebP or GIF · up to 8 MB</span>
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void pick(file);
        }}
      />
      {error && (
        <p role="alert" className="text-sm font-medium text-[#9C3D10]">
          {error}
        </p>
      )}
    </div>
  );
}
