import type { NextConfig } from "next"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  // Preview and local browsers often open http://127.0.0.1, while Next's
  // default allowlist is only localhost. Cross-origin script tags then 403
  // and the calculators never hydrate.
  allowedDevOrigins: ["127.0.0.1"],
}

export default nextConfig
