import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.cursor.com",
    "*.cursor.sh",
  ],
};

export default nextConfig;
