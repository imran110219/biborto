import { PublicField } from "@/components/admin/PublicField";
import { PostStatusPill } from "@/components/ui/Badge";
import Link from "next/link";
import { PostContentFields } from "@/components/blog/PostContentFields";
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
  imageBase,
}: {
  post?: AdminBlogPostDetail;
  draftAction: (formData: FormData) => void | Promise<void>;
  publishAction: (formData: FormData) => void | Promise<void>;
  previewHref?: string;
  imageBase?: string;
}) {
  return (
    <form className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5 rounded-2xl border border-border-default bg-white p-7">
        <PostContentFields
          initialTitle={post?.title}
          initialBody={post?.body}
          initialCoverKey={post?.coverKey}
          initialCoverUrl={post?.coverUrl}
          imageBase={imageBase}
          authorLabel={post?.authorName ? `By ${post.authorName}` : undefined}
          titleClassName="w-full border-0 font-serif text-[34px] font-medium text-text-primary outline-none"
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Publish</h2>
            <PostStatusPill status={post?.status ?? "draft"} />
          </div>
          <PublicField defaultChecked={post?.isPublic ?? true} />
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
