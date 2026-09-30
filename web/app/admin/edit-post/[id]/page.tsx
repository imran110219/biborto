import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { getAdminPostById } from "@/lib/db/queries/blog";
import { PostForm } from "../PostForm";
import { savePost } from "../actions";

export default async function EditPostPage({ params }: PageProps<"/admin/edit-post/[id]">) {
  const { id } = await params;
  const post = await getAdminPostById(id);
  if (!post) notFound();

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-3xl font-medium">Edit post</h1>
          <p className="text-sm text-text-secondary">{post.status === "published" ? "Published" : "Draft"}</p>
        </div>
        <Button href="/admin/edit-post" variant="ghost" size="sm">
          Back to posts
        </Button>
      </div>

      <PostForm
        post={post}
        draftAction={savePost.bind(null, id, "draft")}
        publishAction={savePost.bind(null, id, "published")}
        previewHref={post.status === "published" ? `/blog/${post.slug}` : undefined}
      />
    </AdminLayout>
  );
}
