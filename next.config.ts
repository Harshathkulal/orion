import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["img.clerk.com","image.pollinations.ai"],
  },
};

export default nextConfig;
