import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { CategoryTag, PostStatusPill as StatusPill, VisibilityBadge } from "@/components/ui/Badge";
import { EditIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { getAdminPosts } from "@/lib/db/queries/blog";
import { approvePost, deletePost, rejectPost } from "./actions";

export default async function AdminBlogPostsPage() {
  const posts = await getAdminPosts();

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-4xl font-medium">Blog posts</h1>
          <p className="text-text-secondary">Write, save drafts, and publish stories to the site.</p>
        </div>
        <Button href="/admin/edit-post/new" size="sm">
          <PlusIcon /> New post
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="bg-[#FAF8F3]">
              <tr>
                {["Post", "Category", "Author", "Status", "Visibility", "Updated"].map((h) => (
                  <th key={h} className="px-4 py-3.5 pl-5 text-left text-xs font-bold uppercase tracking-[0.04em] text-text-secondary">
                    {h}
                  </th>
                ))}
                <th className="w-[220px] px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-[#EFEAE0]">
                  <td className="px-4 py-3.5 pl-5 text-[15px] font-semibold">{p.title}</td>
                  <td className="px-4 py-3.5"><CategoryTag>{p.category}</CategoryTag></td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{p.authorName}</td>
                  <td className="px-4 py-3.5">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-4 py-3.5"><VisibilityBadge isPublic={p.isPublic} /></td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{p.updatedAt}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {p.status === "pending" && (
                        <>
                          <form action={approvePost.bind(null, p.id)}>
                            <button className="h-9 rounded-lg bg-brand-green px-3 text-xs font-semibold text-white">Approve</button>
                          </form>
                          <form action={rejectPost.bind(null, p.id)}>
                            <button className="h-9 rounded-lg border border-border-input bg-white px-3 text-xs font-semibold text-[#9C3D10]">Reject</button>
                          </form>
                        </>
                      )}
                      <Link
                        href={`/admin/edit-post/${p.id}`}
                        aria-label={`Edit ${p.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white"
                      >
                        <EditIcon />
                      </Link>
                      <form action={deletePost.bind(null, p.id)}>
                        <button
                          aria-label={`Remove ${p.title}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white text-[#9C3D10]"
                        >
                          <TrashIcon />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-text-secondary">
                    No posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
