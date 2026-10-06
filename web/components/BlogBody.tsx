import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { QuoteIcon } from "@/components/ui/icons";

// blog_posts.body is Markdown. It is rendered as React elements — raw HTML in
// the source is ignored (never executed or injected) — so member-written posts
// can't run script. Two extra rules apply on top of that:
//   • links: only http(s) and mailto, opened in a new tab with rel=ugc/nofollow;
//   • images: only pictures stored in our own R2 `blog/` folder (`imageBase`),
//     which is what the editor's upload produces. Any other image source — an
//     external host, a tracking pixel — is not rendered.
// Posts written before the rich editor (plain "## " headings, "> " quotes and
// blank-line paragraphs) are valid Markdown and render the same as before.
export function BlogBody({ body, imageBase }: { body: string; imageBase?: string }) {
  const components: ComponentProps<typeof ReactMarkdown>["components"] = {
    h1: ({ children }) => <h2 className="font-serif text-2xl font-medium md:text-3xl">{children}</h2>,
    h2: ({ children }) => <h2 className="font-serif text-2xl font-medium md:text-3xl">{children}</h2>,
    h3: ({ children }) => <h3 className="font-serif text-xl font-medium md:text-2xl">{children}</h3>,
    h4: ({ children }) => <h3 className="font-serif text-xl font-medium md:text-2xl">{children}</h3>,
    p: ({ children }) => <p className="text-lg leading-relaxed text-text-article">{children}</p>,
    // Same look as the site's <Quote>, but built here so the paragraph that
    // Markdown wraps the text in inherits the quote's size instead of the body's.
    blockquote: ({ children }) => (
      <blockquote className="flex items-start gap-[18px] py-2">
        <span className="shrink-0 text-accent-amber">
          <QuoteIcon />
        </span>
        <div className="font-serif text-2xl leading-snug text-brand-green md:text-[30px] [&>p]:text-[length:inherit] [&>p]:leading-[inherit] [&>p]:text-brand-green">
          {children}
        </div>
      </blockquote>
    ),
    ul: ({ children }) => <ul className="list-disc space-y-1.5 pl-6 text-lg leading-relaxed text-text-article">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal space-y-1.5 pl-6 text-lg leading-relaxed text-text-article">{children}</ol>,
    hr: () => <hr className="border-border-default" />,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    code: ({ children }) => <code className="rounded bg-black/5 px-1.5 py-0.5 text-[0.9em]">{children}</code>,
    a: ({ href, children }) =>
      href ? (
        <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className="font-semibold text-brand-green underline">
          {children}
        </a>
      ) : (
        <>{children}</>
      ),
    img: ({ src, alt }) =>
      typeof src === "string" && imageBase && src.startsWith(imageBase) ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote R2 URL; may be animated
        <img src={src} alt={alt ?? ""} loading="lazy" className="h-auto w-full rounded-2xl" />
      ) : null,
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={components}
      urlTransform={(url, key) => {
        // Block javascript:, data:, vbscript:, file: … — keep only safe schemes.
        const safe = /^(https?:|mailto:)/i.test(url.trim());
        if (key === "href") return safe ? url : "";
        if (key === "src") return /^https?:/i.test(url.trim()) ? url : "";
        return url;
      }}
    >
      {body}
    </ReactMarkdown>
  );
}
