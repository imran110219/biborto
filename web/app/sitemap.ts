import type { MetadataRoute } from "next";
import { getPublicBusinesses } from "@/lib/db/queries/businesses";
import { getPublishedPublicPosts } from "@/lib/db/queries/blog";
import { getUpcomingEvents } from "@/lib/db/queries/events";
import { getGalleryAlbums } from "@/lib/db/queries/gallery";
import { getPublicMembers } from "@/lib/db/queries/members";

function siteOrigin(): string {
  const value = process.env.APP_URL;
  if (!value) throw new Error("APP_URL must be set to generate the sitemap.");
  return new URL(value).origin;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const [posts, businesses, events, albums, members] = await Promise.all([
    getPublishedPublicPosts(),
    getPublicBusinesses(),
    getUpcomingEvents(),
    getGalleryAlbums(),
    getPublicMembers(),
  ]);

  const staticPaths = ["", "/blog", "/business", "/events", "/gallery", "/members"];
  return [
    ...staticPaths.map((path) => ({ url: `${origin}${path}`, changeFrequency: "weekly" as const })),
    ...posts.map((post) => ({ url: `${origin}/blog/${post.slug}`, changeFrequency: "monthly" as const })),
    ...businesses.map((business) => ({ url: `${origin}/business/${business.slug}`, changeFrequency: "monthly" as const })),
    ...events.map((event) => ({ url: `${origin}/events/${event.slug}`, changeFrequency: "weekly" as const })),
    ...albums.filter((album) => album.isPublic).map((album) => ({ url: `${origin}/gallery/${album.slug}`, changeFrequency: "monthly" as const })),
    ...members.map((member) => ({ url: `${origin}/members/${member.slug}`, changeFrequency: "monthly" as const })),
  ];
}
