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
        protocol: "http",
        hostname: "125.253.121.171",
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
