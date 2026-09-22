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

/** 천 단위 쉼표를 넣은 뒤, 숫자 n개 다음에 커서가 오도록 위치를 셉니다. */
export function caretIndexAfterGroup(raw: string, digitsBeforeCaret: number) {
  const formatted = formatGroupedInput(raw)
  if (digitsBeforeCaret <= 0) return 0
  let seen = 0
  for (let i = 0; i < formatted.length; i++) {
    if (/[\d.]/.test(formatted[i] ?? "")) {
      seen += 1
      if (seen === digitsBeforeCaret) return i + 1
    }
  }
  return formatted.length
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

/** 0~1 요율. 0.009 → "0.9%", 0.1314 → "13.14%" */
export function formatRatePercent(rate: number): string {
  if (!Number.isFinite(rate)) return "—"
  return `${Number((rate * 100).toFixed(4))}%`
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

/** 원 금액을 만원 칸 문자열로 바꿉니다. 다시 원으로 곱하면 같은 원입니다. */
export function wonToManwonField(won: number): string {
  const rounded = Math.round(won)
  const abs = Math.abs(rounded)
  const whole = Math.trunc(abs / 10_000)
  const frac = abs % 10_000
  const body =
    frac === 0 ? String(whole) : `${whole}.${String(frac).padStart(4, "0").replace(/0+$/, "")}`
  return rounded < 0 ? `-${body}` : body
}

/**
 * 만원 칸에 원 금액을 그대로 넣었는지 봅니다.
 * 숫자 자체가 1,000,000 이상(만원으로 읽으면 100억 이상)이고
 * 만 원으로 나누어떨어질 때만, 원으로 친 만원 값을 돌려줍니다.
 */
export function manwonIfTypedAsWon(raw: string): number | null {
  if (!raw || raw.includes(".")) return null
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1_000_000 || n % 10_000 !== 0) return null
  return n / 10_000
}

const KOREAN_SMALL: readonly { mark: string; mult: number }[] = [
  { mark: "천", mult: 1_000 },
  { mark: "백", mult: 100 },
  { mark: "십", mult: 10 },
]

/** 4천, 5백, 12, 4천5백 처럼 만 자리 앞의 수를 읽습니다. */
function koreanSmallCount(head: string): number | null {
  if (!head) return null
  if (/^\d+(?:\.\d+)?$/.test(head)) return Number(head)
  let rest = head
  let total = 0
  let used = false
  for (const { mark, mult } of KOREAN_SMALL) {
    const at = rest.indexOf(mark)
    if (at < 0) continue
    if (rest.indexOf(mark, at + 1) >= 0) return null
    const numPart = rest.slice(0, at)
    if (numPart !== "" && !/^\d+(?:\.\d+)?$/.test(numPart)) return null
    total += (numPart === "" ? 1 : Number(numPart)) * mult
    rest = rest.slice(at + mark.length)
    used = true
  }
  if (!used) return null
  if (rest === "") return total
  if (/^\d+(?:\.\d+)?$/.test(rest)) return total + Number(rest)
  return null
}

/**
 * 4천만, 1억 2천만, 1.2만, 2천원처럼 말한 금액을 원으로 읽습니다.
 * 숫자만 있으면 null입니다.
 */
export function wonFromKorean(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").replace(/\s+/g, "").replace(/원/g, "")
  if (!/[억만천백십]/.test(cleaned)) return null
  if (!/^[0-9.억만천백십]+$/.test(cleaned)) return null
  let rest = cleaned
  let won = 0
  const eok = /^(\d+(?:\.\d+)?)억/.exec(rest)
  if (eok) {
    won += Number(eok[1]) * 100_000_000
    rest = rest.slice(eok[0].length)
  } else if (rest.includes("억")) return null
  if (!rest) return won
  if (rest.endsWith("만")) {
    const head = rest.slice(0, -1)
    if (head === "") return won + 10_000
    const count = koreanSmallCount(head)
    if (count == null) return null
    return won + count * 10_000
  }
  if (won > 0) return null
  return koreanSmallCount(rest)
}

/** 만원 칸. 만 또는 억이 있을 때만 만원 값으로 바꿉니다. */
export function manwonFromKorean(raw: string): number | null {
  if (!/[억만]/.test(raw)) return null
  const won = wonFromKorean(raw)
  if (won == null) return null
  const manwon = won / 10_000
  if (!Number.isFinite(manwon) || manwon < 0) return null
  return manwon
}

export function formatCalcNumber(value: number): string {
  if (!Number.isFinite(value)) return ""
  const rounded = Math.round(value * 10_000) / 10_000
  return Object.is(rounded, -0) ? "0" : String(rounded)
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

/** 결과 한 줄 아래에 지금 주소. 입력값이 주소에 있으면 그대로 보낼 수 있습니다. */
export function shareCopyText(line: string, href?: string) {
  const url =
    href ?? (typeof window === "undefined" ? "" : window.location.href)
  const text = line.trim()
  return url ? `${text}\n${url}` : text
}
