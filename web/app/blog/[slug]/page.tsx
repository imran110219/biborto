import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeaturedBlogTeaser } from "@/components/BlogTeaser";
import { BlogBody } from "@/components/BlogBody";
import { MailIcon, ShareIcon } from "@/components/ui/icons";
import { getPublishedPublicPosts, getPublicPostBySlug } from "@/lib/db/queries/blog";

export async function generateStaticParams() {
  const posts = await getPublishedPublicPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  if (!post) notFound();

  const otherPosts = (await getPublishedPublicPosts()).filter((p) => p.slug !== post.slug);

  return (
    <PublicLayout>
      <article className="flex flex-col items-center gap-10 px-5 pt-16 md:px-20">
        <div className="flex w-full max-w-[820px] flex-col gap-5">
          <div className="flex items-center gap-2.5 text-sm text-text-secondary">
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span>{post.category}</span>
          </div>
          <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight md:text-[58px]">
            {post.title}
          </h1>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green font-serif font-semibold text-bg-public">
                11
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{post.author}</span>
                <span className="text-sm text-text-secondary">
                  {post.date} · {post.readTime} read
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button aria-label="Copy link" className="flex h-11 w-11 items-center justify-center rounded-full border border-border-input bg-white">
                <ShareIcon />
              </button>
              <button aria-label="Share by email" className="flex h-11 w-11 items-center justify-center rounded-full border border-border-input bg-white">
                <MailIcon />
              </button>
            </div>
          </div>
        </div>

        <PlaceholderMedia label="[Cover photo: Khulna University campus]" className="h-[300px] w-full max-w-[1120px] md:h-[480px]" rounded="rounded-3xl" />

        <div className="flex w-full max-w-[720px] flex-col gap-6">
          <BlogBody body={post.body} />

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full bg-brand-green-tint px-3.5 py-2 text-sm font-semibold text-brand-green">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      <section className="mt-24 flex flex-col gap-10 bg-[#EDE8DC] px-5 py-20 md:px-20">
        <SectionHeader eyebrow="Keep reading" title="More stories" viewAllHref="/blog" viewAllLabel="All posts" />
        <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
          {otherPosts.map((p) => (
            <FeaturedBlogTeaser key={p.slug} post={p} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
