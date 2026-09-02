import { CALCULATORS } from "./catalog.ts"
import { SITE_URL } from "./site.ts"

/** Bing·Yandex IndexNow. 파일명은 public/{key}.txt 와 같아야 합니다. */
export const INDEXNOW_KEY = "8f3a1c9e6b2d4a70b5c8e1d9f0a6b347"

export function publicPaths() {
  return [
    "/",
    "/calc/",
    "/realty/",
    "/contact/",
    "/privacy/",
    ...CALCULATORS.map((item) => `/calc/${item.slug}/`),
  ]
}

export function publicUrls() {
  return publicPaths().map((path) => (path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`))
}

export function calcFooterGroups() {
  return [
    {
      title: "생활",
      items: CALCULATORS.filter((item) => item.group === "today"),
    },
    {
      title: "급여",
      items: CALCULATORS.filter((item) => item.group === "work"),
    },
    {
      title: "부동산",
      items: CALCULATORS.filter((item) => item.group !== "today" && item.group !== "work"),
    },
  ] as const
}
