import { CALCULATORS, getCalculator, type CalcItem } from "./catalog.ts"

/** 계산기마다 이어서 볼 것. 앞에 둔 순서가 우선이고, 부족하면 같은 분류에서 채웁니다. */
const RELATED: Record<string, string[]> = {
  "take-home": ["offer-compare", "weekly-holiday", "overtime-pay"],
  "weekly-holiday": ["min-wage", "part-time-month", "overtime-pay"],
  "min-wage": ["weekly-holiday", "part-time-month", "take-home"],
  "part-time-month": ["weekly-holiday", "min-wage", "prorate-pay"],
  "prorate-pay": ["take-home", "weekly-holiday", "severance"],
  "overtime-pay": ["weekly-holiday", "take-home", "annual-leave"],
  "annual-leave": ["weekly-holiday", "overtime-pay", "severance"],
  severance: ["take-home", "annual-leave", "parental-leave"],
  "parental-leave": ["maternity-leave", "take-home", "annual-leave"],
  "maternity-leave": ["parental-leave", "take-home", "annual-leave"],
  "offer-compare": ["take-home", "severance", "weekly-holiday"],
  "side-job-tax": ["take-home", "weekly-holiday", "benefit-net"],
  "benefit-net": ["parental-leave", "maternity-leave", "severance"],
  "cert-payback": ["take-home", "offer-compare", "annual-leave"],
  "rent-convert": ["jeonse-vs-rent", "jeonse", "brokerage"],
  "jeonse-vs-rent": ["rent-convert", "jeonse", "moving"],
  jeonse: ["loan-interest", "jeonse-vs-rent", "rent-convert"],
  brokerage: ["moving", "closing-cost", "rent-convert"],
  moving: ["brokerage", "jeonse-vs-rent", "jeonse"],
  acquisition: ["closing-cost", "brokerage", "mortgage"],
  "closing-cost": ["acquisition", "brokerage", "mortgage"],
  mortgage: ["loan-interest", "ltv", "dsr"],
  "loan-interest": ["mortgage", "jeonse", "dsr"],
  ltv: ["dsr", "mortgage", "loan-interest"],
  dsr: ["ltv", "loan-interest", "mortgage"],
  yield: ["rent-convert", "jeonse-vs-rent", "holding-tax"],
  "import-duty": ["sale-vat", "dutch", "quick"],
  "sale-vat": ["import-duty", "dutch", "quick"],
  dutch: ["ladder", "quick", "sale-vat"],
  ladder: ["dutch", "quick", "sale-vat"],
  "vehicle-tax": ["car-tax", "acquisition", "quick"],
  "car-tax": ["vehicle-tax", "dutch", "quick"],
  deposit: ["quick", "dutch", "take-home"],
  "rent-credit": ["rent-convert", "jeonse-vs-rent", "moving"],
  quick: ["dutch", "ladder", "sale-vat"],
}

export function relatedCalculators(slug: string, limit = 4): CalcItem[] {
  const seen = new Set<string>([slug])
  const picked: CalcItem[] = []

  function push(next: string) {
    if (seen.has(next) || picked.length >= limit) return
    const item = getCalculator(next)
    if (!item) return
    seen.add(next)
    picked.push(item)
  }

  for (const next of RELATED[slug] ?? []) push(next)
  const current = getCalculator(slug)
  if (current && picked.length < limit) {
    for (const item of CALCULATORS) {
      if (item.group === current.group) push(item.slug)
    }
  }
  return picked
}
