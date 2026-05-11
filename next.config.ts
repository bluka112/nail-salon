import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.slingacademy.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "clerk.com" },
      {
        protocol: "https",
        hostname: "jrgpmsxkdrwzz7hm.public.blob.vercel-storage.com",
      },
    ],
  },

  async redirects() {
    return [
      {
        // this will match `/english(default)/something` being requested
        source: "/",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
