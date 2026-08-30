import type { MetadataRoute } from "next"
import { CALCULATORS } from "@/lib/catalog"
import { SITE_URL } from "@/lib/site"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const pages = ["", "/contact/", "/privacy/", "/realty/"]
  return [
    ...pages.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.6,
    })),
    ...CALCULATORS.map((item) => ({
      url: `${SITE_URL}/calc/${item.slug}/`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
