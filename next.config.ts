import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Utiliser "export" uniquement en production pour GitHub Pages
  // En dev, laisser le mode normal pour gérer les 404 correctement
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  basePath: "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
