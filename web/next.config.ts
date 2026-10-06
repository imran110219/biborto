import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    // The admin Gallery lived at /admin/photos before it was renamed; keep old
    // bookmarks and links working.
    return [
      { source: "/admin/photos", destination: "/admin/gallery", permanent: true },
      { source: "/admin/photos/:path*", destination: "/admin/gallery/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
