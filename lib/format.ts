/** 원 미만 절사. 음수는 0에 가깝게. */
export function truncWon(value: number) {
  if (!Number.isFinite(value) || value === 0) return 0
  return value > 0 ? Math.floor(value) : Math.ceil(value)
}

export function formatGroupedInput(raw: string) {
  if (!raw) return ""
  const negative = raw.startsWith("-")
  const body = negative ? raw.slice(1) : raw
  const [intPart, frac = null] = body.split(".", 2)
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  const withDot = frac !== null ? `.${frac}` : ""
  return `${negative ? "-" : ""}${grouped}${withDot}`
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[,\s원만원억]/g, "").trim()
  if (!cleaned) return null
  const n = Number(cleaned)
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

export function formatWon(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return "—"
  return `${new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value)}원`
}

export function formatSignedWon(value: number, fractionDigits = 0): string {
  const rounded = Number(value.toFixed(fractionDigits))
  if (rounded > 0) return `+${formatWon(rounded, fractionDigits)}`
  return formatWon(rounded, fractionDigits)
}

export function formatPlain(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return "—"
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatPercent(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return "—"
  return `${value.toFixed(fractionDigits)}%`
}

export function formatKoreanUnit(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0원"
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(Math.round(value))
  const jo = Math.floor(abs / 1_000_000_000_000)
  const afterJo = abs % 1_000_000_000_000
  const eok = Math.floor(afterJo / 100_000_000)
  const rest = afterJo % 100_000_000
  const man = Math.floor(rest / 10_000)
  const won = rest % 10_000
  const parts: string[] = []
  if (jo) parts.push(`${jo.toLocaleString("ko-KR")}조`)
  if (eok) parts.push(`${eok.toLocaleString("ko-KR")}억`)
  if (man) parts.push(`${man.toLocaleString("ko-KR")}만`)
  if (won && jo === 0 && eok === 0) parts.push(`${won.toLocaleString("ko-KR")}`)
  if (parts.length === 0) return `${sign}${abs.toLocaleString("ko-KR")}원`
  return `${sign}${parts.join(" ")}원`
}

export function manwonToWon(manwon: number): number {
  return Math.round(manwon * 10_000)
}

export function wonToManwon(won: number): number {
  return won / 10_000
}

export function copyText(value: string) {
  return navigator.clipboard.writeText(value)
}

/** 카카오 한 줄. 예: 실수령 3,210,000원 · 주휴 포함 */
export function kakaoCopyLine(label: string, amountText: string, note?: string) {
  const core = `${label} ${amountText}`.trim()
  const extra = note?.trim()
  return extra ? `${core} · ${extra}` : core
}
