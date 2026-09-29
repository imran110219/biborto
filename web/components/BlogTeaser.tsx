import Link from "next/link";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import type { BlogPost } from "@/lib/types";

export function FeaturedBlogTeaser({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="flex flex-col gap-5 text-text-primary">
      <PlaceholderMedia label="[Featured post cover]" className="h-[340px]" />
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

export function BlogTeaserRow({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="grid grid-cols-[140px_1fr] gap-6 border-b border-border-default py-6 text-text-primary sm:grid-cols-[180px_1fr]"
    >
      <PlaceholderMedia label="" className="h-[124px]" rounded="rounded-2xl" />
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
