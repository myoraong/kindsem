import { truncWon } from "./format.ts"
import { INTEREST_TAX, RETIREMENT } from "./policy.generated.ts"
import { INCOME_BRACKETS, progressiveTax } from "./tax-brackets.ts"

/** 소득세법 제48조 제1항 제1호. 1년 미만은 1년. */
export function serviceYearsDeduction(years: number) {
  const y = Math.max(1, Math.floor(years))
  const row =
    RETIREMENT.years.find((item) => y <= item.maxYears) ?? RETIREMENT.years[RETIREMENT.years.length - 1]
  return row.base + row.perYear * (y - row.offsetYears)
}

/** 소득세법 제48조 제1항 제2호. */
export function convertedSalaryDeduction(converted: number) {
  if (converted <= 0) return 0
  const row =
    RETIREMENT.converted.find((item) => converted <= item.upTo) ??
    RETIREMENT.converted[RETIREMENT.converted.length - 1]
  return truncWon(row.intercept + Math.max(0, converted - row.floor) * row.rate)
}

/**
 * 소득세법 제48조·제55조.
 * 환산급여 과세표준에 기본세율을 적용한 뒤 근속연수/12.
 * 지방소득세는 소득세의 10%.
 */
export function calcRetirementTax(input: { payout: number; years: number }) {
  if (input.payout <= 0 || input.years <= 0) return null
  const years = Math.max(1, Math.floor(input.years))
  const rawService = serviceYearsDeduction(years)
  const serviceDeduction = Math.min(input.payout, rawService)
  const afterService = Math.max(0, input.payout - serviceDeduction)
  const converted = truncWon((afterService * 12) / years)
  const convertedDeduction = convertedSalaryDeduction(converted)
  const taxable = Math.max(0, converted - convertedDeduction)
  const convertedTax = progressiveTax(taxable, INCOME_BRACKETS).tax
  const national = truncWon((convertedTax * years) / 12)
  const local = truncWon(national * INTEREST_TAX.localShare)
  return {
    years,
    serviceDeduction,
    converted,
    convertedDeduction,
    taxable,
    convertedTax,
    national,
    local,
    total: national + local,
  }
}
