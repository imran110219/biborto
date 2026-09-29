import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { Quote } from "@/components/ui/Quote";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeaturedBlogTeaser } from "@/components/BlogTeaser";
import { MailIcon, ShareIcon } from "@/components/ui/icons";
import { blogPosts } from "@/lib/mock-data";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const isMainPost = post.slug === blogPosts[0].slug;
  const otherPosts = blogPosts.filter((p) => p.slug !== post.slug);

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
            {isMainPost ? "Planning the grand reunion: what we need from you" : post.title}
          </h1>
          {isMainPost && (
            <p className="text-xl leading-relaxed text-text-muted">
              We are bringing Batch 11 back to campus. Here is how the day will work, and the three things
              the committee needs from every batchmate.
            </p>
          )}
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
          {isMainPost ? (
            <>
              <p className="text-lg leading-relaxed text-text-article">
                The grand reunion is set for Saturday, December 12, on the Khulna University campus. It will
                be the first time many of us walk through Gollamari together since our final exams, and we
                want every batchmate who can make it to be there.
              </p>
              <h2 className="font-serif text-2xl font-medium md:text-3xl">1. Register before [DEADLINE]</h2>
              <p className="text-lg leading-relaxed text-text-article">
                Sign in to the member panel and press RSVP on the event page. Tell us whether you are
                bringing family, so the committee can plan food and seating. The registration fee is
                [AMOUNT] per person.
              </p>
              <Quote>The day belongs to everyone who shared these classrooms. Come as you are.</Quote>
              <h2 className="font-serif text-2xl font-medium md:text-3xl">2. Send us your old photos</h2>
              <p className="text-lg leading-relaxed text-text-article">
                We are building a slideshow for the cultural evening. Upload campus-era photos to the Gallery
                from your member account, or share them with your department representative.
              </p>
              <PlaceholderMedia label="[Inline photo]" className="h-[300px]" rounded="rounded-2xl" />
              <h2 className="font-serif text-2xl font-medium md:text-3xl">3. Volunteer for a team</h2>
              <p className="text-lg leading-relaxed text-text-article">
                We need hands for registration, decoration, photography and the evening program. Reply in the
                member panel with the team you would like to join.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {["Reunion", "Announcements", "Volunteering"].map((t) => (
                  <span key={t} className="rounded-full bg-brand-green-tint px-3.5 py-2 text-sm font-semibold text-brand-green">
                    {t}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-lg leading-relaxed text-text-article">
              Full story coming soon — this teaser links to a real article slug so the page structure is
              ready once the content team writes it up.
            </p>
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
