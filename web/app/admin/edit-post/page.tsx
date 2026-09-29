import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { UploadIcon } from "@/components/ui/icons";
import { blogPosts } from "@/lib/mock-data";

export default function AdminEditPostPage() {
  const post = blogPosts[0];

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-3xl font-medium">Edit post</h1>
          <p className="text-sm text-text-secondary">Last saved 2 minutes ago</p>
        </div>
        <Button variant="ghost" size="sm">
          Back to posts
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5 rounded-2xl border border-border-default bg-white p-7">
          <input
            defaultValue={post.title}
            className="w-full border-0 font-serif text-[34px] font-medium text-text-primary outline-none"
          />
          <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border-default bg-bg-admin py-10 text-center">
            <UploadIcon size={20} />
            <span className="font-semibold">Add a cover photo</span>
            <span className="text-sm text-text-secondary">JPG or PNG, at least 1600 px wide</span>
          </div>
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-bg-admin p-2">
            {["B", "I", "H2", "❝", "🔗", "🖼", "▶"].map((t) => (
              <button key={t} className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold">
                {t}
              </button>
            ))}
          </div>
          <p className="text-[17px] leading-relaxed text-text-article">
            The grand reunion is set for Saturday, December 12, on the Khulna University campus. It will be
            the first time many of us walk through Gollamari together since our final exams.
          </p>
          <h2 className="font-serif text-2xl font-medium">1. Register before [DEADLINE]</h2>
          <p className="text-[17px] leading-relaxed text-text-article">
            Sign in to the member panel and press RSVP on the event page. Tell us whether you are bringing
            family…
          </p>
          <p className="text-text-secondary">Keep writing, or type &quot;/&quot; to add a photo, video or event card</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Publish</h2>
              <span className="rounded-full bg-accent-amber-tint px-2.5 py-1 text-xs font-semibold text-accent-amber-text">
                Draft
              </span>
            </div>
            <span className="text-xs font-semibold text-text-secondary">Who can read it</span>
            <label className="flex items-start gap-3 rounded-xl border border-brand-green bg-brand-green-tint p-3.5">
              <input type="radio" name="visibility" defaultChecked className="mt-1 accent-brand-green" />
              <span className="flex flex-col">
                <span className="font-semibold">Public</span>
                <span className="text-sm text-text-secondary">Anyone visiting the site</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-border-default p-3.5">
              <input type="radio" name="visibility" className="mt-1" />
              <span className="flex flex-col">
                <span className="font-semibold">Members only</span>
                <span className="text-sm text-text-secondary">Signed-in Batch 11 members</span>
              </span>
            </label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1">
                Save draft
              </Button>
              <Button size="sm" className="flex-1">
                Publish
              </Button>
            </div>
            <a href={`/blog/${post.slug}`} className="text-center text-sm font-semibold text-brand-green">
              Preview on site
            </a>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-6">
            <h2 className="font-semibold">Details</h2>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Category
              <select className="h-11 rounded-lg border border-border-input px-3 font-normal" defaultValue={post.category}>
                <option>{post.category}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Author
              <select className="h-11 rounded-lg border border-border-input px-3 font-normal" defaultValue={post.author}>
                <option>{post.author}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Tags
              <input defaultValue="reunion, volunteering" className="h-11 rounded-lg border border-border-input px-3 font-normal" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="accent-brand-green" />
              Feature on the home page
            </label>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
