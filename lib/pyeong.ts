import { truncWon } from "./format.ts"

/** 1평 = 6자×6자, 1자 = 10/33m → 400/121㎡. 1㎡ = 0.3025평. */
export const M2_PER_PYEONG = 400 / 121

export function pyeongToM2(pyeong: number) {
  if (!Number.isFinite(pyeong) || pyeong <= 0) return null
  return pyeong * M2_PER_PYEONG
}

export function m2ToPyeong(m2: number) {
  if (!Number.isFinite(m2) || m2 <= 0) return null
  return m2 / M2_PER_PYEONG
}

export function formatM2(value: number) {
  return `${formatArea(value)}㎡`
}

export function formatPyeong(value: number) {
  return `${formatArea(value)}평`
}

function formatArea(value: number) {
  if (!Number.isFinite(value)) return "—"
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  }).format(value)
}

export function calcPyeongPrice(input: {
  priceWon: number
  area: number
  unit: "pyeong" | "m2"
}) {
  if (!Number.isFinite(input.priceWon) || input.priceWon <= 0) return null
  const pyeong = input.unit === "pyeong" ? input.area : m2ToPyeong(input.area)
  const m2 = input.unit === "m2" ? input.area : pyeongToM2(input.area)
  if (pyeong == null || m2 == null || pyeong <= 0 || m2 <= 0) return null
  return {
    pyeong,
    m2,
    perPyeong: truncWon(input.priceWon / pyeong),
    perM2: truncWon(input.priceWon / m2),
  }
}
