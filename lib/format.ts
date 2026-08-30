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
  const eok = Math.floor(abs / 100_000_000)
  const rest = abs % 100_000_000
  const man = Math.floor(rest / 10_000)
  const won = rest % 10_000
  const parts: string[] = []
  if (eok) parts.push(`${eok}억`)
  if (man) parts.push(`${man.toLocaleString("ko-KR")}만`)
  if (won && eok === 0) parts.push(`${won.toLocaleString("ko-KR")}`)
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
