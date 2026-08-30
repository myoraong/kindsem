import { CALCULATORS, getCalculator, type CalcItem } from "@/lib/catalog"

export const TODAY_SLUGS = ["quick", "dutch", "sale-vat", "vehicle-tax"] as const

export function isTodaySlug(slug: string) {
  return (TODAY_SLUGS as readonly string[]).includes(slug)
}

export function todayItems(): CalcItem[] {
  return TODAY_SLUGS.map((slug) => getCalculator(slug)).filter(
    (item): item is CalcItem => Boolean(item),
  )
}

export function allTodayItems() {
  return CALCULATORS.filter((item) => isTodaySlug(item.slug))
}
