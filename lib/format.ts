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

function grouped(n: number): string {
  return n.toLocaleString("ko-KR")
}

export function formatKoreanUnit(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0원"
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(Math.round(value))
  const gyeong = Math.floor(abs / 10_000_000_000_000_000)
  const jo = Math.floor(abs / 1_000_000_000_000) % 10_000
  const eok = Math.floor(abs / 100_000_000) % 10_000
  const man = Math.floor(abs / 10_000) % 10_000
  const won = abs % 10_000
  const parts: string[] = []
  if (gyeong) parts.push(`${grouped(gyeong)}경`)
  if (jo) parts.push(`${grouped(jo)}조`)
  if (eok) parts.push(`${grouped(eok)}억`)
  if (man) parts.push(`${grouped(man)}만`)
  if (won && !gyeong && !jo && !eok) parts.push(grouped(won))
  if (parts.length === 0) return `${sign}${grouped(abs)}원`
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
