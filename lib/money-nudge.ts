import { formatPlain } from "./format.ts"

export type NudgeUnit = "만원" | "원" | "%"

export type MoneyNudge = {
  step: number
  label: string
}

/** 칸에 있는 금액에서 한 번에 움직일 폭. 0이나 다른 단위는 없습니다. */
export function moneyNudge(unit: string, value: number): MoneyNudge | null {
  if (!Number.isFinite(value) || value <= 0) return null
  if (unit === "만원") {
    const step = value >= 10_000 ? 1_000 : value >= 1_000 ? 100 : value >= 100 ? 10 : 1
    return { step, label: `${formatPlain(step)}만` }
  }
  if (unit === "원") {
    const step = value >= 1_000_000 ? 10_000 : value >= 100_000 ? 1_000 : value >= 1_000 ? 100 : 10
    return { step, label: `${formatPlain(step)}원` }
  }
  if (unit === "%") return { step: 0.1, label: "0.1%" }
  return null
}

export function applyMoneyNudge(value: number, delta: number): string | null {
  if (!Number.isFinite(value) || !Number.isFinite(delta)) return null
  const next = Math.round((value + delta) * 10_000) / 10_000
  if (next <= 0) return null
  return String(next)
}
