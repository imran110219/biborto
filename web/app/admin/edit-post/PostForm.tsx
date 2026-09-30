import Link from "next/link";
import { UploadIcon } from "@/components/ui/icons";
import { BLOG_CATEGORIES, type AdminBlogPostDetail } from "@/lib/types";

const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";
const fieldClasses = "h-11 rounded-lg border border-border-input px-3 font-normal";
const submitBase = "h-11 flex-1 rounded-full text-sm font-semibold transition-colors";
const ghostSubmit = `${submitBase} border border-border-default bg-white text-text-primary hover:bg-black/5`;
const primarySubmit = `${submitBase} border border-brand-green bg-brand-green text-white hover:bg-brand-green-dark`;

export function PostForm({
  post,
  draftAction,
  publishAction,
  previewHref,
}: {
  post?: AdminBlogPostDetail;
  draftAction: (formData: FormData) => void | Promise<void>;
  publishAction: (formData: FormData) => void | Promise<void>;
  previewHref?: string;
}) {
  return (
    <form className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5 rounded-2xl border border-border-default bg-white p-7">
        <input
          name="title"
          defaultValue={post?.title}
          required
          placeholder="Post title"
          className="w-full border-0 font-serif text-[34px] font-medium text-text-primary outline-none"
        />
        <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border-default bg-bg-admin py-10 text-center">
          <UploadIcon size={20} />
          <span className="font-semibold">Add a cover photo</span>
          <span className="text-sm text-text-secondary">Not available yet — file storage isn&apos;t wired up</span>
        </div>
        <textarea
          name="body"
          defaultValue={post?.body}
          rows={16}
          placeholder="Write the post, or paste it in..."
          className="w-full flex-1 resize-none border-0 text-[17px] leading-relaxed text-text-article outline-none"
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Publish</h2>
            <span className="rounded-full bg-accent-amber-tint px-2.5 py-1 text-xs font-semibold text-accent-amber-text">
              {post?.status === "published" ? "Published" : "Draft"}
            </span>
          </div>
          <span className="text-xs font-semibold text-text-secondary">Who can read it</span>
          <label className="flex items-start gap-3 rounded-xl border border-border-default p-3.5 has-[:checked]:border-brand-green has-[:checked]:bg-brand-green-tint">
            <input
              type="radio"
              name="visibility"
              value="public"
              defaultChecked={!post || post.visibility === "public"}
              className="mt-1 accent-brand-green"
            />
            <span className="flex flex-col">
              <span className="font-semibold">Public</span>
              <span className="text-sm text-text-secondary">Anyone visiting the site</span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-border-default p-3.5 has-[:checked]:border-brand-green has-[:checked]:bg-brand-green-tint">
            <input
              type="radio"
              name="visibility"
              value="members_only"
              defaultChecked={post?.visibility === "members_only"}
              className="mt-1"
            />
            <span className="flex flex-col">
              <span className="font-semibold">Members only</span>
              <span className="text-sm text-text-secondary">Signed-in Batch 11 members</span>
            </span>
          </label>
          <div className="flex gap-2">
            <button type="submit" formAction={draftAction} className={ghostSubmit}>
              Save draft
            </button>
            <button type="submit" formAction={publishAction} className={primarySubmit}>
              Publish
            </button>
          </div>
          {previewHref && (
            <Link href={previewHref} className="text-center text-sm font-semibold text-brand-green">
              Preview on site
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-6">
          <h2 className="font-semibold">Details</h2>
          <label className={labelClasses}>
            Category
            <select name="category" defaultValue={post?.category ?? BLOG_CATEGORIES[0]} className={fieldClasses}>
              {BLOG_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClasses}>
            Byline
            <input
              name="authorName"
              defaultValue={post?.authorName}
              placeholder="e.g. Reunion committee"
              className={fieldClasses}
            />
          </label>
          <label className={labelClasses}>
            Tags
            <input name="tags" defaultValue={post?.tags.join(", ")} placeholder="reunion, volunteering" className={fieldClasses} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={post?.featured} className="accent-brand-green" />
            Feature on the home page
          </label>
        </div>
      </div>
    </form>
  );
}
