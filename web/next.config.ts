import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Convex file storage — uploaded logos / headshots / news images
      { protocol: "https", hostname: "*.convex.cloud" },
      { protocol: "https", hostname: "*.convex.site" },
      // Founder-supplied logo / press-image URLs (any https host)
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
