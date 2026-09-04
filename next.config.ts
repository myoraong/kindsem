import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import type { NextConfig } from "next"
import { renderAdsTxt } from "./lib/adsense"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

function applyDotenv(file: string) {
  const path = join(process.cwd(), file)
  if (!existsSync(path)) return
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const eq = line.indexOf("=")
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

applyDotenv(".env")
applyDotenv(".env.local")

function writePublicAdsTxt() {
  const path = join(process.cwd(), "public", "ads.txt")
  let existing = ""
  try {
    existing = readFileSync(path, "utf8")
  } catch {
    existing = ""
  }
  const next = renderAdsTxt({
    envPub: process.env.NEXT_PUBLIC_ADSENSE_PUB,
    envClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
    existing,
  })
  if (next !== existing) writeFileSync(path, next)
}

writePublicAdsTxt()

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  // Preview iframe often sends Origin: null (opaque). Next then 403s /_next
  // scripts and the local site looks blank even though HTML 200s.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "::1",
    "null",
    "cursor.com",
    "*.cursor.com",
    "cursor.sh",
    "*.cursor.sh",
  ],
}

export default nextConfig
