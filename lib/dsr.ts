import { encodeCalcQuery } from "./calc-persist.ts"
import { wonToManwonField } from "./format.ts"
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

/**
 * 계산된 월 납입(원)을 DSR의 주담대 또는 기타 대출 칸으로 넘깁니다.
 * 그 칸만 주소에 실어, 연소득 등 나머지 저장값은 그대로 둡니다.
 */
export function dsrMonthlyQuery(field: "mortgage" | "other", monthlyWon: number): string {
  if (field !== "mortgage" && field !== "other") return ""
  if (!Number.isFinite(monthlyWon) || monthlyWon <= 0) return ""
  return encodeCalcQuery({ [field]: wonToManwonField(monthlyWon) })
}
