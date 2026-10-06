import Link from "next/link";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import type { BlogPost } from "@/lib/types";

// Real cover photo when the post has one, otherwise the placeholder block.
function TeaserCover({ post, className, rounded, label }: { post: BlogPost; className: string; rounded: string; label: string }) {
  if (!post.coverUrl) return <PlaceholderMedia label={label} className={className} rounded={rounded} />;
  // eslint-disable-next-line @next/next/no-img-element -- remote R2 URL
  return <img src={post.coverUrl} alt="" loading="lazy" className={`${className} ${rounded} w-full object-cover`} />;
}

export function FeaturedBlogTeaser({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="flex flex-col gap-5 text-text-primary">
      <TeaserCover post={post} className="h-[340px]" rounded="rounded-[20px]" label="[Featured post cover]" />
      <span className="inline-flex w-fit items-center rounded-full bg-accent-amber-tint px-2.5 py-1 text-xs font-semibold text-accent-amber-text">
        {post.category}
      </span>
      <h3 className="font-serif text-3xl font-medium leading-snug md:text-[34px]">{post.title}</h3>
      <span className="text-sm text-text-secondary">
        {post.author} · {post.date} · {post.readTime} read
      </span>
    </Link>
  );
}

// Grid card for the blog index.
export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-4 text-text-primary">
      <div className="overflow-hidden rounded-2xl">
        <TeaserCover post={post} className="h-[200px] transition-transform duration-300 group-hover:scale-[1.02]" rounded="rounded-2xl" label="" />
      </div>
      <span className="w-fit rounded-full bg-accent-amber-tint px-2.5 py-1 text-xs font-semibold text-accent-amber-text">{post.category}</span>
      <h3 className="font-serif text-2xl font-medium leading-snug">{post.title}</h3>
      <span className="text-sm text-text-secondary">
        {post.author} · {post.date} · {post.readTime} read
      </span>
    </Link>
  );
}

export function BlogTeaserRow({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="grid grid-cols-[140px_1fr] gap-6 border-b border-border-default py-6 text-text-primary sm:grid-cols-[180px_1fr]"
    >
      <TeaserCover post={post} className="h-[124px]" rounded="rounded-2xl" label="" />
      <div className="flex flex-col justify-center gap-2.5">
        <span className="text-xs font-bold tracking-[0.08em] text-accent-amber-text uppercase">
          {post.category}
        </span>
        <h3 className="font-serif text-xl font-medium leading-snug">{post.title}</h3>
        <span className="text-sm text-text-secondary">
          {post.author} · {post.date}
        </span>
      </div>
    </Link>
  );
}
