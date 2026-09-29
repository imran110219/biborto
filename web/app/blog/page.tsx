import { redirect, notFound } from "next/navigation";
import { getPublishedPublicPosts } from "@/lib/db/queries/blog";

export default async function BlogIndexPage() {
  const [latest] = await getPublishedPublicPosts();
  if (!latest) notFound();
  redirect(`/blog/${latest.slug}`);
}
