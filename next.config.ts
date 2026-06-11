import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // ✅ Ye Next.js 16 ko batayega ki config sahi hai
  turbopack: {}, 
};

export default nextConfig;