import Link from "next/link";
import { PostStatusPill } from "@/components/ui/Badge";
import { PostEditorShell } from "@/components/blog/PostEditorShell";
import { PostSettingsFields } from "@/components/blog/PostSettingsFields";
import type { AdminBlogPostDetail } from "@/lib/types";

const submitBase = "h-11 flex-1 rounded-full text-sm font-semibold transition-colors";
const ghostSubmit = `${submitBase} border border-border-default bg-white text-text-primary hover:bg-black/5`;
const primarySubmit = `${submitBase} border border-brand-green bg-brand-green text-white hover:bg-brand-green-dark`;

// Admin post editor. Same shell as the member submit form (see PostEditorShell);
// admins see the full set of settings and both Save draft and Publish.
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
    <form>
      <PostEditorShell
        content={{
          initialTitle: post?.title,
          initialBody: post?.body,
          initialCoverKey: post?.coverKey,
          initialCoverUrl: post?.coverUrl,
          imageBase,
          authorLabel: post?.authorName ? `By ${post.authorName}` : undefined,
        }}
        status={<PostStatusPill status={post?.status ?? "draft"} />}
        settings={<PostSettingsFields variant="admin" post={post} />}
        actions={
          <>
            <div className="flex gap-2">
              <button type="submit" formAction={draftAction} className={ghostSubmit}>
                Save draft
              </button>
              <button type="submit" formAction={publishAction} className={primarySubmit}>
                Publish
              </button>
            </div>
            {previewHref && (
              <Link href={previewHref} className="hidden text-center text-sm font-semibold text-brand-green lg:block">
                View on site
              </Link>
            )}
          </>
        }
      />
    </form>
  );
}
