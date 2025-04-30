import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@mysten/walrus', '@mysten/walrus-wasm'],
  images: {
    domains: ['images.unsplash.com'],
  },
};

export default nextConfig;
