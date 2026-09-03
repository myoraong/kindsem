import { DSR_POLICY } from "./policy.generated.ts"

export type Repayment = "equal-payment" | "equal-principal" | "interest-only"

export function monthlyRate(annualPercent: number): number {
  return annualPercent / 100 / 12
}

export function equalPayment(principal: number, annualPercent: number, months: number) {
  const r = monthlyRate(annualPercent)
  if (months <= 0 || principal <= 0) {
    return { monthly: 0, totalInterest: 0, totalPay: 0 }
  }
  if (r === 0) {
    const monthly = principal / months
    return { monthly, totalInterest: 0, totalPay: principal }
  }
  const monthly = (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1)
  const totalPay = monthly * months
  return { monthly, totalInterest: totalPay - principal, totalPay }
}

/** 원리금균등 첫 12개월(또는 남은 기간) 이자. 월액은 equalPayment을 그대로 씁니다. */
export function equalPaymentFirstYearInterest(
  principal: number,
  annualPercent: number,
  months: number,
) {
  if (months <= 0 || principal <= 0) return 0
  const { monthly } = equalPayment(principal, annualPercent, months)
  const r = monthlyRate(annualPercent)
  if (r === 0) return 0
  let remaining = principal
  let interest = 0
  const n = Math.min(12, months)
  for (let i = 0; i < n; i++) {
    const iPart = remaining * r
    interest += iPart
    remaining -= monthly - iPart
    if (remaining < 0) remaining = 0
  }
  return interest
}

export function equalPrincipal(principal: number, annualPercent: number, months: number) {
  const r = monthlyRate(annualPercent)
  if (months <= 0 || principal <= 0) {
    return { first: 0, last: 0, totalInterest: 0, totalPay: 0, principalPart: 0 }
  }
  const principalPart = principal / months
  const first = principalPart + principal * r
  const last = principalPart + principalPart * r
  const totalInterest = (principal * r * (months + 1)) / 2
  return {
    first,
    last,
    totalInterest,
    totalPay: principal + totalInterest,
    principalPart,
  }
}

export function interestOnly(principal: number, annualPercent: number, months: number) {
  const monthly = principal * monthlyRate(annualPercent)
  const totalInterest = monthly * months
  return { monthly, totalInterest, totalPay: principal + totalInterest }
}

export function calcLoanInterest(input: {
  principal: number
  annualPercent: number
  months: number
  method: Repayment
}) {
  if (input.principal <= 0 || input.months <= 0 || !Number.isFinite(input.annualPercent)) return null
  if (input.method === "equal-principal") {
    const calc = equalPrincipal(input.principal, input.annualPercent, input.months)
    return {
      method: input.method,
      monthly: calc.first,
      first: calc.first,
      last: calc.last,
      totalInterest: calc.totalInterest,
      totalPay: calc.totalPay,
    }
  }
  if (input.method === "interest-only") {
    const calc = interestOnly(input.principal, input.annualPercent, input.months)
    return {
      method: input.method,
      monthly: calc.monthly,
      first: calc.monthly,
      last: calc.monthly,
      totalInterest: calc.totalInterest,
      totalPay: calc.totalPay,
    }
  }
  const calc = equalPayment(input.principal, input.annualPercent, input.months)
  return {
    method: input.method,
    monthly: calc.monthly,
    first: calc.monthly,
    last: calc.monthly,
    totalInterest: calc.totalInterest,
    totalPay: calc.totalPay,
  }
}

export function dsrLimit(annualIncome: number, existingAnnual: number, ratio = DSR_POLICY.bank) {
  const cap = annualIncome * ratio
  const remain = Math.max(0, cap - existingAnnual)
  return { cap, remain, monthlyRemain: remain / 12 }
}
