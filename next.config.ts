import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.slingacademy.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "clerk.com" },
    ],
  },
};

export default nextConfig;
