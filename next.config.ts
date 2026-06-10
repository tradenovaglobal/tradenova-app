import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  typescript: {
    ignoreBuildErrors: true, // ✅ 'i' small hai
  },
  
  eslint: {
    ignoreDuringBuilds: true, // ✅ 'i' small hai
  },
};

export default nextConfig;