import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cấu hình hình ảnh
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Thêm nhiều domain khác nếu cần
      // {
      //   protocol: "https",
      //   hostname: "**.yourdomain.com",
      // },
    ],
  },

  // Cải thiện hiệu suất & build
  reactStrictMode: true,
  swcMinify: true,

  // Tối ưu bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Tự động remove console.log khi build production
  },

  // Headers & Security (khuyến khích)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },

  // Nếu dùng App Router thì bật experimental (tùy chọn)
  // experimental: {
  //   serverActions: true,
  // },
};

export default nextConfig;