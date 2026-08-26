import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel supporte Next.js nativement, pas besoin de "export"
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
