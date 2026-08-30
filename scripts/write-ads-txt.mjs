#!/usr/bin/env node
/**
 * NEXT_PUBLIC_ADSENSE_PUB / NEXT_PUBLIC_ADSENSE_CLIENT 가 있으면
 * public/ads.txt 에 Google ads.txt 한 줄을 채웁니다.
 * 값이 없으면 가짜 pub- 줄을 넣지 않고, 안내 주석만 유지합니다.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const adsPath = join(root, "public/ads.txt")

function applyDotenv(file) {
  const path = join(root, file)
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

const COMMENT = `# Kindsem ads.txt
# Google AdSense 승인 후 받은 게시자 ID로 아래 한 줄을 채웁니다.
# 형식: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
#
# .env.local 에 NEXT_PUBLIC_ADSENSE_PUB 또는 NEXT_PUBLIC_ADSENSE_CLIENT 를 넣고
# 다시 빌드하면 이 파일이 채워집니다. 가짜 pub- 값은 넣지 마세요.
`

function parsePub(value) {
  const match = String(value ?? "")
    .trim()
    .match(/pub-\d+/)
  return match ? match[0] : null
}

function existingPub(text) {
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const match = trimmed.match(
      /^google\.com,\s*(pub-\d+)\s*,\s*DIRECT\s*,\s*f08c47fec0942fa0$/i,
    )
    if (match) return match[1]
  }
  return null
}

const existing = existsSync(adsPath) ? readFileSync(adsPath, "utf8") : ""
const pub =
  parsePub(process.env.NEXT_PUBLIC_ADSENSE_PUB) ||
  parsePub(process.env.NEXT_PUBLIC_ADSENSE_CLIENT) ||
  existingPub(existing)

const next = pub
  ? `${COMMENT}google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
  : COMMENT

if (next !== existing) writeFileSync(adsPath, next)
if (pub) console.log(`ads.txt ${pub}`)
