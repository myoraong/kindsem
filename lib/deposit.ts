/** 예·적금. 이율은 직접 넣고, 세후는 이자소득세 14%+지방소득세 1.4%만 뺍니다. */

import { INTEREST_TAX } from "./policy.generated.ts"

export const INTEREST_INCOME_TAX = INTEREST_TAX.national
export const LOCAL_INCOME_ON_INTEREST = INTEREST_TAX.localShare
/** 이자소득 14% + 지방소득세 1.4%. 곱하면 부동소수점이 어긋나 15.4%로 둡니다. */
export const INTEREST_WITHHOLDING = INTEREST_TAX.withholding

export type DepositKind = "savings" | "installment"
export type DepositCompound = "simple" | "monthly"

export function afterInterestTax(interest: number) {
  return Math.round(interest * (1 - INTEREST_WITHHOLDING))
}

export function calcDeposit(input: {
  kind: DepositKind
  compound: DepositCompound
  principal: number
  monthly?: number
  annualRate: number
  months: number
}) {
  if (input.annualRate < 0 || input.months <= 0) return null
  const r = input.annualRate / 100
  const n = input.months
  let principal = 0
  let interest = 0

  if (input.kind === "savings") {
    if (input.principal <= 0) return null
    principal = input.principal
    if (input.compound === "simple") {
      interest = principal * r * (n / 12)
    } else {
      interest = principal * ((1 + r / 12) ** n - 1)
    }
  } else {
    const monthly = input.monthly ?? 0
    if (monthly <= 0) return null
    principal = monthly * n
    if (input.compound === "simple") {
      interest = monthly * (r / 12) * ((n * (n + 1)) / 2)
    } else {
      const i = r / 12
      if (i === 0) interest = 0
      else interest = monthly * (((1 + i) ** n - 1) / i) - principal
    }
  }

  const grossInterest = Math.round(interest)
  const netInterest = afterInterestTax(grossInterest)
  return {
    principal: Math.round(principal),
    grossInterest,
    netInterest,
    grossTotal: Math.round(principal) + grossInterest,
    netTotal: Math.round(principal) + netInterest,
    withholding: INTEREST_WITHHOLDING,
  }
}
