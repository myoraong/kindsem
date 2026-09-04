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
  // Dev must not rewrite ads.txt — that dirties git and keeps showing Commit & Push.
  if (process.env.NODE_ENV !== "production") return
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
  // Preview / in-IDE browser can send Origin/Referer that is not the page URL.
  // Next 16 then 403s /_next scripts and CSS; HTML still 200s so the viewport
  // looks solid black (especially in a dark webview) after hydration fails.
  // `*.host` is one DNS label; `**.host` covers nested hosts like
  // abc.cloud.cursor.sh. `cursor` is the hostname of vscode-webview://cursor.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "::1",
    "null",
    "cursor",
    "cursor.com",
    "*.cursor.com",
    "**.cursor.com",
    "cursor.sh",
    "*.cursor.sh",
    "**.cursor.sh",
    "vscode.dev",
    "*.vscode.dev",
    "**.vscode.dev",
    "vscode-cdn.net",
    "*.vscode-cdn.net",
    "**.vscode-cdn.net",
    "cursorusercontent.com",
    "*.cursorusercontent.com",
    "**.cursorusercontent.com",
  ],
}

export default nextConfig
