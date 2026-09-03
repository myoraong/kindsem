#!/usr/bin/env node
/**
 * 네이버 서치어드바이저 RSS 제출용 피드.
 * 본문 요약과 계산기 URL을 담아 Yeti가 목록을 다시 읽게 합니다.
 */
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { CALCULATORS } from "../lib/catalog.ts"
import { POLICY_FETCHED_AT } from "../lib/policy.generated.ts"
import { calcDescription, calcSeo } from "../lib/seo.ts"
import { SITE_NAME, SITE_URL } from "../lib/site.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const out = join(root, "public/rss.xml")

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function rfc822(day) {
  return new Date(`${day}T09:00:00+09:00`).toUTCString()
}

const pubDate = rfc822(POLICY_FETCHED_AT)
const items = [
  {
    title: `생활·급여·부동산 계산기 · ${SITE_NAME}`,
    url: `${SITE_URL}/`,
    description:
      "카인드셈은 실수령액, 주휴수당, 퇴직금, 취득세, 중개수수료, 자동차세, 양도세, DSR 등 40여 가지를 법령·고시 현행본으로 계산하는 무료 계산기입니다.",
  },
  {
    title: `부동산 계산기 · ${SITE_NAME}`,
    url: `${SITE_URL}/realty/`,
    description: "취득세, 양도세, 증여세, 중개수수료, 전월세 전환율, LTV, DSR 계산기. 법령·고시 기준.",
  },
  ...CALCULATORS.map((item) => {
    const seo = calcSeo(item.slug)
    return {
      title: seo.query,
      url: `${SITE_URL}/calc/${item.slug}/`,
      description: `${calcDescription(item)} ${seo.also.join(", ")}`,
    }
  }),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml(`${SITE_NAME} 계산기`)}</title>
<link>${SITE_URL}/</link>
<description>${escapeXml("생활·급여·부동산 계산기. 세율·상한은 법제처 현행 법령·고시입니다.")}</description>
<language>ko</language>
<lastBuildDate>${pubDate}</lastBuildDate>
${items
  .map(
    (item) => `<item>
<title>${escapeXml(item.title)}</title>
<link>${item.url}</link>
<guid isPermaLink="true">${item.url}</guid>
<pubDate>${pubDate}</pubDate>
<description>${escapeXml(item.description)}</description>
</item>`,
  )
  .join("\n")}
</channel>
</rss>
`

writeFileSync(out, xml)
console.log(`rss.xml ${items.length}개`)
