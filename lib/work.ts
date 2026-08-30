import { CALCULATORS, getCalculator, type CalcItem } from "@/lib/catalog"

export const WORK_SLUGS = [
  "take-home",
  "weekly-holiday",
  "overtime-pay",
  "annual-leave",
  "severance",
  "parental-leave",
  "offer-compare",
  "side-job-tax",
  "benefit-net",
  "cert-payback",
] as const

export function isWorkSlug(slug: string) {
  return (WORK_SLUGS as readonly string[]).includes(slug)
}

export function workItems(): CalcItem[] {
  return WORK_SLUGS.map((slug) => getCalculator(slug)).filter(
    (item): item is CalcItem => Boolean(item),
  )
}

export function allWorkItems() {
  return CALCULATORS.filter((item) => isWorkSlug(item.slug))
}
