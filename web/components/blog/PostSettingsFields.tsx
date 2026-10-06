import { PublicField } from "@/components/admin/PublicField";
import { BLOG_CATEGORIES } from "@/lib/types";

const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";
const fieldClasses = "h-11 w-full rounded-lg border border-border-input bg-white px-3 text-sm font-normal";

type SettingsPost = {
  category?: string;
  authorName?: string;
  tags?: string[];
  featured?: boolean;
  isPublic?: boolean;
};

// The post's settings, in the same order and wording on both editors. Members
// get the essentials only (category, tags); admins additionally control the
// byline, home-page feature and public visibility. Status and the Publish /
// Submit actions live in the editor shell, not here.
export function PostSettingsFields({ variant, post }: { variant: "admin" | "member"; post?: SettingsPost }) {
  const admin = variant === "admin";
  return (
    <div className="flex flex-col gap-4">
      <label className={labelClasses}>
        Category
        <select
          name="category"
          required
          defaultValue={post?.category ?? (admin ? BLOG_CATEGORIES[0] : "")}
          className={fieldClasses}
        >
          {!admin && (
            <option value="" disabled>
              Choose a category
            </option>
          )}
          {BLOG_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClasses}>
        Tags <span className="font-normal text-text-secondary">(optional)</span>
        <input name="tags" defaultValue={post?.tags?.join(", ")} placeholder="reunion, volunteering" className={fieldClasses} />
      </label>

      {admin && (
        <>
          <label className={labelClasses}>
            Byline <span className="font-normal text-text-secondary">(optional)</span>
            <input name="authorName" defaultValue={post?.authorName} placeholder="e.g. Reunion committee" className={fieldClasses} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={post?.featured} className="accent-brand-green" />
            Feature on the home page
          </label>
          <PublicField defaultChecked={post?.isPublic ?? true} />
        </>
      )}
    </div>
  );
}
