import type { MetadataRoute } from "next"
import { POLICY_FETCHED_AT } from "@/lib/policy.generated"
import { publicPaths } from "@/lib/site-urls"
import { SITE_URL } from "@/lib/site"

export const dynamic = "force-static"

const HOT = new Set([
  "/calc/take-home/",
  "/calc/severance/",
  "/calc/brokerage/",
  "/calc/acquisition/",
  "/calc/capital-gains/",
  "/calc/weekly-holiday/",
  "/calc/dsr/",
])

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${POLICY_FETCHED_AT}T00:00:00+09:00`)
  return publicPaths().map((path) => {
    const url = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`
    const hot = path === "/" || HOT.has(path)
    return {
      url,
      lastModified,
      changeFrequency: hot ? ("daily" as const) : ("weekly" as const),
      priority: path === "/" ? 1 : HOT.has(path) ? 0.9 : path === "/calc/" ? 0.7 : 0.8,
    }
  })
}
