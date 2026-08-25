import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Pour export statique (GitHub Pages)
  basePath: process.env.NODE_ENV === "production" ? "/mialigo" : "",
  images: {
    unoptimized: true, // Requis pour export statique
  },
};

export default nextConfig;
