import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.APP_URL;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/account/",
        "/api/",
        "/signin",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/blog/submit",
        "/business/submit",
      ],
    },
    ...(siteUrl ? { sitemap: `${new URL(siteUrl).origin}/sitemap.xml` } : {}),
  };
}
