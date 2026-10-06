import { AdminLayout } from "@/components/layout/AdminLayout";
import { PostForm } from "../PostForm";
import { createPost } from "../actions";
import { getBlogImageBase } from "@/lib/blog/images";

export default function NewPostPage() {
  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-3xl font-medium">New post</h1>
          <p className="text-sm text-text-secondary">Not saved yet</p>
        </div>
      </div>

      <PostForm
        draftAction={createPost.bind(null, "draft")}
        publishAction={createPost.bind(null, "published")}
        imageBase={getBlogImageBase()}
      />
    </AdminLayout>
  );
}
