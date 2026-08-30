import { getCalculator, type CalcItem } from "@/lib/catalog"

export type RealtyCategoryId = "tax" | "invest" | "loan" | "youth"

export type RealtyCategory = {
  id: RealtyCategoryId
  title: string
  slugs: string[]
}

export const REALTY_CATEGORIES: RealtyCategory[] = [
  {
    id: "tax",
    title: "세금 계산",
    slugs: [
      "brokerage",
      "capital-gains",
      "corporate-gains",
      "holding-tax",
      "acquisition",
      "license-tax",
      "gift-tax",
      "inheritance",
      "encumbered-gift",
      "closing-cost",
    ],
  },
  {
    id: "invest",
    title: "임대 투자",
    slugs: ["yield", "rent-convert"],
  },
  {
    id: "loan",
    title: "대출 금융",
    slugs: ["ltv", "dsr", "mortgage", "jeonse"],
  },
  {
    id: "youth",
    title: "청년 주거",
    slugs: ["moving"],
  },
]

export function realtyItems(category: RealtyCategory): CalcItem[] {
  return category.slugs
    .map((slug) => getCalculator(slug))
    .filter((item): item is CalcItem => Boolean(item))
}

export function categoryForSlug(slug: string): RealtyCategory | undefined {
  return REALTY_CATEGORIES.find((category) => category.slugs.includes(slug))
}

export function isRealtySlug(slug: string) {
  return Boolean(categoryForSlug(slug))
}

export const REALTY_SLUGS = REALTY_CATEGORIES.flatMap((category) => category.slugs)

export function allRealtyItems() {
  return REALTY_SLUGS.map((slug) => getCalculator(slug)).filter(
    (item): item is CalcItem => Boolean(item),
  )
}
