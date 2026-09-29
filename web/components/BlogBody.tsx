import { Quote } from "@/components/ui/Quote";

// blog_posts.body (db/schema.sql) is a small markdown subset by
// convention — "## " headings and "> " blockquotes, blank-line
// paragraphs — not arbitrary markdown. A tiny hand-rolled renderer here
// avoids pulling in a full markdown library for that.
export function BlogBody({ body }: { body: string }) {
  const blocks = body.trim().split(/\n\s*\n/);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="font-serif text-2xl font-medium md:text-3xl">
              {block.slice(3)}
            </h2>
          );
        }
        if (block.startsWith("> ")) {
          return <Quote key={i}>{block.slice(2)}</Quote>;
        }
        return (
          <p key={i} className="text-lg leading-relaxed text-text-article">
            {block}
          </p>
        );
      })}
    </>
  );
}
