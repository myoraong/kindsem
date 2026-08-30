import { LTV_POLICY } from "./policy.generated.ts"

export type LtvZone = "unregulated" | "adjusted" | "speculation"
export type LtvBorrower = "general" | "first" | "conditional" | "extra"

export type LtvInput = {
  collateralWon: number
  desiredWon: number
  zone: LtvZone
  borrower: LtvBorrower
}

export type LtvResult = {
  banned: boolean
  rate: number
  maxByRate: number
  firstTimeCap: number | null
  maxLoan: number
  desiredLtv: number | null
  allowed: boolean
  note: string
}

/** 은행업감독규정 별표 6. LTV %와 생애최초 대출 한도만 적용합니다. */
export function ltvRate(
  zone: LtvZone,
  borrower: LtvBorrower
): { rate: number; banned: boolean; note: string } {
  if (borrower === "extra" && LTV_POLICY.extraBanned) {
    return {
      rate: 0,
      banned: true,
      note: "미처분 1주택 추가구입은 주택구입 주담대가 막혀 있습니다.",
    }
  }
  if (borrower === "first") {
    return { rate: LTV_POLICY.firstTime, banned: false, note: "생애최초 한도" }
  }
  if (zone === "unregulated") {
    return { rate: LTV_POLICY.unregulated, banned: false, note: "비규제 일반 한도" }
  }
  return { rate: LTV_POLICY.regulated, banned: false, note: "규제지역 일반 한도" }
}

export function calculateLtv(input: LtvInput): LtvResult | null {
  const { collateralWon, desiredWon, zone, borrower } = input
  if (collateralWon <= 0) return null

  const { rate, banned, note } = ltvRate(zone, borrower)
  const maxByRate = Math.floor(collateralWon * rate)
  const firstTimeCap = !banned && borrower === "first" ? LTV_POLICY.firstTimeCap : null
  let maxLoan = banned ? 0 : maxByRate
  if (firstTimeCap != null) {
    maxLoan = Math.min(maxLoan, firstTimeCap)
  }
  const desiredLtv = desiredWon > 0 ? (desiredWon / collateralWon) * 100 : null
  const allowed = !banned && desiredWon > 0 && desiredWon <= maxLoan

  return {
    banned,
    rate,
    maxByRate,
    firstTimeCap,
    maxLoan,
    desiredLtv,
    allowed: desiredWon > 0 ? allowed : false,
    note,
  }
}
