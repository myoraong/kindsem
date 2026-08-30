import { RENT_CREDIT } from "./policy.generated.ts"

/**
 * 조세특례제한법 제95조의2 현행. 2026년 세제개편안(한도 1,200만, 청년 일괄 17%)은 아직 법이 아니라 넣지 않습니다.
 */

export const RENT_CREDIT_SALARY_CAP = RENT_CREDIT.salaryCap
export const RENT_CREDIT_SALARY_HIGH_RATE = RENT_CREDIT.salaryHighRate
export const RENT_CREDIT_INCOME_CAP = RENT_CREDIT.incomeCap
export const RENT_CREDIT_INCOME_HIGH_RATE = RENT_CREDIT.incomeHighRate
export const RENT_CREDIT_RENT_CAP = RENT_CREDIT.rentCap
export const RENT_CREDIT_RATE = RENT_CREDIT.rate
export const RENT_CREDIT_RATE_LOW = RENT_CREDIT.rateLow

export function calcRentCredit(input: {
  annualRent: number
  totalSalary: number
  globalIncome?: number | null
  wageOnly: boolean
  noHome: boolean
}) {
  if (input.annualRent <= 0 || input.totalSalary < 0) return null
  if (!input.noHome) {
    return { eligible: false as const, reason: "home" as const }
  }
  if (input.totalSalary > RENT_CREDIT_SALARY_CAP) {
    return { eligible: false as const, reason: "salary" as const }
  }
  if (!input.wageOnly && (input.globalIncome ?? 0) > RENT_CREDIT_INCOME_CAP) {
    return { eligible: false as const, reason: "income" as const }
  }

  const recognized = Math.min(input.annualRent, RENT_CREDIT_RENT_CAP)
  const highRate =
    input.totalSalary <= RENT_CREDIT_SALARY_HIGH_RATE &&
    (input.wageOnly || (input.globalIncome ?? 0) <= RENT_CREDIT_INCOME_HIGH_RATE)
  const rate = highRate ? RENT_CREDIT_RATE_LOW : RENT_CREDIT_RATE
  return {
    eligible: true as const,
    recognized,
    rate,
    credit: Math.round(recognized * rate),
  }
}
