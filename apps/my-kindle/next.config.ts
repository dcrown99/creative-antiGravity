import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔴 CRITICAL: これがないと Monorepo 内の UI パッケージをビルドできずエラーになる
  transpilePackages: ["@repo/ui"],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
    ],
  },
};

export default nextConfig;