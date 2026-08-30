import { DSR_POLICY } from "./policy.generated.ts"

export type DsrBank = "bank" | "nonbank"

export function dsrLimitRatio(bank: DsrBank) {
  return bank === "bank" ? DSR_POLICY.bank : DSR_POLICY.nonbank
}

/** 은행업감독규정 별표 6 은행 DSR, 비은행 50%. 스트레스 가산은 별표에 없어 넣지 않습니다. */
export function calculateDsr(input: {
  incomeWon: number
  mortgageMonthlyWon: number
  otherMonthlyWon: number
  bank: DsrBank
}) {
  if (input.incomeWon <= 0) return null
  const limit = dsrLimitRatio(input.bank)
  const annual = (input.mortgageMonthlyWon + input.otherMonthlyWon) * 12
  const dsr = annual / input.incomeWon
  const cap = input.incomeWon * limit
  const remain = Math.max(0, cap - annual)
  return {
    limit,
    annual,
    dsr,
    cap,
    remain,
    monthlyRemain: remain / 12,
    allowed: dsr <= limit + 1e-9,
  }
}
