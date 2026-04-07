import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "your-backend-domain.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
