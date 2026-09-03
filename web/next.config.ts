import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Convex file storage (future startup logos / investor avatars)
    remotePatterns: [
      { protocol: "https", hostname: "*.convex.cloud" },
      { protocol: "https", hostname: "*.convex.site" },
    ],
  },
};

export default nextConfig;
