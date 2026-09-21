import { truncWon } from "./format.ts"
import { WAGE_TAX_AT_10M, WAGE_TAX_BANDS } from "./simplified-wage-tax-table.ts"

export { SIMPLIFIED_WAGE_TAX_REVISED } from "./simplified-wage-tax-table.ts"

/** 소득세법 시행령 별표 2 제3호. 8세 이상 20세 이하 자녀. 개정 2026. 2. 27. */
export const CHILD_CREDIT_ONE = 20_830
export const CHILD_CREDIT_TWO = 45_830
export const CHILD_CREDIT_EXTRA = 33_330

const TEN_MILLION = 10_000_000

/** 10원 미만 절사. */
export function trunc10Won(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.floor(value / 10) * 10
}

export function childTaxCredit(children = 0) {
  const n = Math.max(0, Math.floor(children))
  if (n <= 0) return 0
  if (n === 1) return CHILD_CREDIT_ONE
  if (n === 2) return CHILD_CREDIT_TWO
  return CHILD_CREDIT_TWO + CHILD_CREDIT_EXTRA * (n - 2)
}

function familyTax(taxes: readonly number[], family: number) {
  const n = Math.max(1, Math.floor(family) || 1)
  if (n <= 11) return taxes[n - 1] ?? 0
  const at11 = taxes[10] ?? 0
  const at10 = taxes[9] ?? 0
  return Math.max(0, at11 - (at10 - at11) * (n - 11))
}

/** 초과액 × 98% × 세율. 원 미만 절사. */
function percentOf98(excess: number, percent: number) {
  return Math.floor((excess * 98 * percent) / 10_000)
}

function percentOf(excess: number, percent: number) {
  return Math.floor((excess * percent) / 100)
}

/**
 * 월급여 1천만 원 초과. 별표 2 제6호 하단.
 * 1천만 원 초과 1,400만 원 이하만 25,000원을 더한다.
 */
function taxAbove10M(monthlyWon: number, taxAt10M: number) {
  if (monthlyWon <= 14_000_000) {
    return taxAt10M + percentOf98(monthlyWon - TEN_MILLION, 35) + 25_000
  }
  if (monthlyWon <= 28_000_000) {
    return taxAt10M + 1_397_000 + percentOf98(monthlyWon - 14_000_000, 38)
  }
  if (monthlyWon <= 30_000_000) {
    return taxAt10M + 6_610_600 + percentOf98(monthlyWon - 28_000_000, 40)
  }
  if (monthlyWon <= 45_000_000) {
    return taxAt10M + 7_394_600 + percentOf(monthlyWon - 30_000_000, 40)
  }
  if (monthlyWon <= 87_000_000) {
    return taxAt10M + 13_394_600 + percentOf(monthlyWon - 45_000_000, 42)
  }
  return taxAt10M + 31_034_600 + percentOf(monthlyWon - 87_000_000, 45)
}

function bandTaxes(monthlyWon: number) {
  const thousand = Math.floor(monthlyWon / 1000)
  const bands = WAGE_TAX_BANDS
  if (thousand < bands[0][0]) return null
  let low = 0
  let high = bands.length - 1
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (bands[mid][0] <= thousand) low = mid
    else high = mid - 1
  }
  return bands[low].slice(1)
}

/**
 * 소득세법 시행령 [별표 2] 근로소득 간이세액.
 * 공제대상가족은 본인을 포함한다. 11명을 넘으면 10명·11명 세액 차이로 뺀다.
 */
export function simplifiedWageTax(monthlyWon: number, family: number) {
  const wage = Math.max(0, monthlyWon)
  if (wage > TEN_MILLION) return taxAbove10M(wage, familyTax(WAGE_TAX_AT_10M, family))
  if (wage === TEN_MILLION) return familyTax(WAGE_TAX_AT_10M, family)
  const taxes = bandTaxes(wage)
  if (!taxes) return 0
  return familyTax(taxes, family)
}

export function withholdingRatePercent(rate?: number) {
  if (rate === 80 || rate === 100 || rate === 120) return rate
  return 100
}

/** 표 세액에서 자녀 세액을 뺀 뒤 80·100·120%를 곱하고 10원 미만을 버린다. */
export function simplifiedWithholdingTax(input: {
  monthlyWage: number
  family: number
  children?: number
  ratePercent?: number
}) {
  const tableMonthly = simplifiedWageTax(input.monthlyWage, input.family)
  const childCredit = childTaxCredit(input.children)
  const afterChild = Math.max(0, tableMonthly - childCredit)
  const ratePercent = withholdingRatePercent(input.ratePercent)
  const incomeMonthly = trunc10Won(truncWon(afterChild * (ratePercent / 100)))
  return { tableMonthly, childCredit, ratePercent, incomeMonthly }
}
