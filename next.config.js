/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移动端 PWA 友好
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  // 实验性：Server Actions（后期加功能用）
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

module.exports = nextConfig;
