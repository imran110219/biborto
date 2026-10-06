"use client";

import { useState } from "react";
import { BlogBody } from "@/components/BlogBody";
import { CoverImageField } from "./CoverImageField";
import { RichTextEditor } from "./RichTextEditor";

// The writing surface shared by the admin post editor and the member submit
// form: title, cover photo and the rich-text body, with a Write / Preview
// switch. Preview renders the current text through the same BlogBody the public
// post page uses, so what you see is what readers will get. Submits `title`,
// `coverKey` and `body` as ordinary form fields.
export function PostContentFields({
  initialTitle = "",
  initialBody = "",
  initialCoverKey = "",
  initialCoverUrl,
  imageBase,
  titlePlaceholder = "Post title",
  authorLabel,
}: {
  initialTitle?: string;
  initialBody?: string;
  initialCoverKey?: string;
  initialCoverUrl?: string;
  imageBase?: string;
  titlePlaceholder?: string;
  authorLabel?: string;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [title, setTitle] = useState(initialTitle);
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  const [body, setBody] = useState(initialBody);

  const tabClass = (t: "write" | "preview") =>
    `h-9 rounded-full px-4 text-sm font-semibold transition-colors ${tab === t ? "bg-white shadow-sm" : "text-text-secondary"}`;

  return (
    <div className="flex flex-col gap-5">
      <input
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={160}
        placeholder={titlePlaceholder}
        aria-label="Post title"
        className="w-full border-0 bg-transparent font-serif text-[28px] font-medium leading-tight text-text-primary outline-none placeholder:text-text-secondary/50 md:text-[34px]"
      />

      <div role="tablist" aria-label="Editor mode" className="flex w-fit gap-1 rounded-full bg-black/5 p-1">
        <button type="button" role="tab" aria-selected={tab === "write"} onClick={() => setTab("write")} className={tabClass("write")}>
          Write
        </button>
        <button type="button" role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")} className={tabClass("preview")}>
          Preview
        </button>
      </div>

      {/* Both panes stay mounted so switching tabs never loses the editor's state. */}
      <div hidden={tab !== "write"} className="flex flex-col gap-5">
        <CoverImageField initialKey={initialCoverKey} initialUrl={initialCoverUrl} onChange={setCoverUrl} />
        <RichTextEditor name="body" defaultValue={initialBody} onChange={setBody} />
      </div>

      <div hidden={tab !== "preview"}>
        <article aria-label="Post preview" className="flex flex-col gap-6 rounded-2xl border border-border-default bg-bg-public p-6 sm:p-8">
          <p className="w-fit rounded-full bg-accent-amber-tint px-3 py-1 text-xs font-semibold text-accent-amber-text">
            Preview — this is how your post will look once published
          </p>
          <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight">{title || "Untitled post"}</h1>
          {authorLabel && <span className="text-sm text-text-secondary">{authorLabel}</span>}
          {/* eslint-disable-next-line @next/next/no-img-element -- remote R2 URL */}
          {coverUrl && <img src={coverUrl} alt="" className="h-auto max-h-[420px] w-full rounded-3xl object-cover" />}
          <div className="flex w-full max-w-[720px] flex-col gap-6">
            {body.trim() ? <BlogBody body={body} imageBase={imageBase} /> : <p className="text-text-secondary">Nothing to preview yet — write something first.</p>}
          </div>
        </article>
      </div>
    </div>
  );
}
