import { redirect } from "next/navigation";
import { blogPosts } from "@/lib/mock-data";

export default function BlogIndexPage() {
  redirect(`/blog/${blogPosts[0].slug}`);
}
