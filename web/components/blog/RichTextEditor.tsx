"use client";

import { useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { uploadBlogImage } from "@/lib/blog/upload-client";

// A WYSIWYG editor (TipTap) whose value is stored as Markdown: the visible
// editor is rich, but what's saved — and what BlogBody renders — is plain
// Markdown text, so existing posts open in it and nothing is stored as HTML.
// The current Markdown is mirrored into a hidden <input name={name}> so the host
// <form> (a server action) submits it like any other field.

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  // Called with the Markdown on every change (used by the Preview tab).
  onChange?: (markdown: string) => void;
};

const markdownOf = (editor: Editor): string => (editor.storage as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();

// Add https:// to bare domains; accept only http(s) and mailto.
function normalizeLink(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return undefined;
  if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return undefined; // javascript:, data:, … rejected
  return /\./.test(value) && !/\s/.test(value) ? `https://${value}` : undefined;
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active ?? false}
      disabled={disabled}
      // mousedown, not click, keeps the editor's selection while a button is pressed
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors disabled:opacity-40 ${
        active ? "bg-brand-green text-white" : "text-text-primary hover:bg-black/5"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span aria-hidden className="mx-1 h-5 w-px bg-border-default" />;

export function RichTextEditor({ name, defaultValue = "", placeholder = "Write your story…", onChange }: Props) {
  const [markdown, setMarkdown] = useState(defaultValue);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [status, setStatus] = useState<{ kind: "error" | "info"; text: string } | undefined>();
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);

  async function insertImages(files: File[]) {
    const editor = editorRef.current;
    if (!editor || files.length === 0) return;
    setUploading(true);
    setStatus({ kind: "info", text: files.length > 1 ? "Uploading images…" : "Uploading image…" });
    try {
      for (const file of files) {
        const { url } = await uploadBlogImage(file);
        const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 120);
        // Each image goes in its own paragraph after the block the cursor is in
        // (never splitting text, and never replacing the selection), followed by
        // an empty paragraph so typing continues below it. Keeping the image
        // alone in its paragraph also keeps the saved Markdown unambiguous.
        const { $to } = editor.state.selection;
        const at = $to.depth >= 1 ? $to.after(1) : $to.pos;
        editor
          .chain()
          .focus()
          .insertContentAt(at, [
            { type: "paragraph", content: [{ type: "image", attrs: { src: url, alt } }] },
            { type: "paragraph" },
          ])
          .run();
      }
      setStatus(undefined);
    } catch (error) {
      setStatus({ kind: "error", text: error instanceof Error ? error.message : "The upload failed." });
    } finally {
      setUploading(false);
    }
  }

  const editor = useEditor({
    immediatelyRender: false, // the page is server-rendered; the editor mounts on the client
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow ugc" } }),
      // inline: images live inside a paragraph (as in Markdown); insertImages() puts each in its own.
      Image.configure({ inline: true, HTMLAttributes: { class: "blog-editor-image" } }),
      Placeholder.configure({ placeholder }),
      // html:false → pasted/typed HTML is never kept as raw markup.
      Markdown.configure({ html: false, tightLists: true, bulletListMarker: "-", linkify: false, breaks: false }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: { class: "blog-editor-content", "aria-label": "Post body" },
      handlePaste: (_view, event) => {
        const files = [...(event.clipboardData?.files ?? [])].filter((f) => f.type.startsWith("image/"));
        if (files.length === 0) return false;
        void insertImages(files);
        return true;
      },
      handleDrop: (_view, event) => {
        const files = [...((event as DragEvent).dataTransfer?.files ?? [])].filter((f) => f.type.startsWith("image/"));
        if (files.length === 0) return false;
        event.preventDefault();
        void insertImages(files);
        return true;
      },
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor;
    },
    onUpdate: ({ editor }) => {
      const next = markdownOf(editor);
      setMarkdown(next);
      onChange?.(next);
    },
  });

  function applyLink() {
    if (!editor) return;
    const href = normalizeLink(linkValue);
    if (!href) {
      setStatus({ kind: "error", text: "Enter a web address starting with http:// or https://, or a mailto: link." });
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setLinkOpen(false);
    setLinkValue("");
    setStatus(undefined);
  }

  const can = (cb: (chain: ReturnType<Editor["can"]>) => boolean) => (editor ? cb(editor.can()) : false);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border-input bg-white">
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b border-border-default bg-[#FAF8F3] p-1.5">
        <ToolbarButton label="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <span className="italic">I</span>
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Heading" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>
        <ToolbarButton label="Subheading" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarButton>
        <ToolbarButton label="Quote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          “ ”
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Bulleted list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          • List
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          1. List
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          label={editor?.isActive("link") ? "Remove link" : "Add link"}
          active={editor?.isActive("link")}
          onClick={() => {
            if (!editor) return;
            if (editor.isActive("link")) editor.chain().focus().extendMarkRange("link").unsetLink().run();
            else {
              setLinkValue("");
              setLinkOpen((v) => !v);
            }
          }}
        >
          Link
        </ToolbarButton>
        <ToolbarButton label="Insert image" disabled={uploading} onClick={() => fileInput.current?.click()}>
          {uploading ? "Uploading…" : "Image"}
        </ToolbarButton>
        <ToolbarButton label="Horizontal rule" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
          ―
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Undo" disabled={!can((c) => c.undo())} onClick={() => editor?.chain().focus().undo().run()}>
          ↶
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!can((c) => c.redo())} onClick={() => editor?.chain().focus().redo().run()}>
          ↷
        </ToolbarButton>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = "";
            void insertImages(files);
          }}
        />
      </div>

      {linkOpen && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border-default bg-white p-2">
          <input
            autoFocus
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            placeholder="https://example.com"
            aria-label="Link address"
            className="h-9 min-w-[220px] flex-1 rounded-lg border border-border-input px-3 text-sm"
          />
          <button type="button" onClick={applyLink} className="h-9 rounded-lg bg-brand-green px-3 text-sm font-semibold text-white">
            Apply
          </button>
          <button type="button" onClick={() => setLinkOpen(false)} className="h-9 rounded-lg border border-border-input px-3 text-sm font-semibold">
            Cancel
          </button>
        </div>
      )}

      <EditorContent editor={editor} className="blog-editor" />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-default px-3 py-2 text-xs text-text-secondary">
        <span role={status?.kind === "error" ? "alert" : "status"} className={status?.kind === "error" ? "font-medium text-[#9C3D10]" : ""}>
          {status?.text ?? "Tip: paste or drop images straight into the editor."}
        </span>
        <span>{markdown.length.toLocaleString()} characters</span>
      </div>

      <input type="hidden" name={name} value={markdown} />
    </div>
  );
}
