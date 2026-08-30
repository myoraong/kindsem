/**
 * 고용보험법 시행령 제95조 · 제95조의3.
 * 상한·하한·지급률만 넣습니다. 맞돌봄 상한표는 제95조의3제1항 가~바.
 */

export const PARENTAL_FLOOR = 700_000

export type ParentalMode = "general" | "both" | "single"

type Band = { fromMonth: number; toMonth: number; rate: number; cap: number }

/** 제95조 제1항. 7개월째 이후는 종료일까지 같은 지급률·상한. */
const GENERAL_BANDS: Band[] = [
  { fromMonth: 1, toMonth: 3, rate: 1, cap: 2_500_000 },
  { fromMonth: 4, toMonth: 6, rate: 1, cap: 2_000_000 },
  { fromMonth: 7, toMonth: Number.POSITIVE_INFINITY, rate: 0.8, cap: 1_600_000 },
]

/** 제95조의3 제3항 한부모. */
const SINGLE_BANDS: Band[] = [
  { fromMonth: 1, toMonth: 3, rate: 1, cap: 3_000_000 },
  { fromMonth: 4, toMonth: 6, rate: 1, cap: 2_000_000 },
  { fromMonth: 7, toMonth: Number.POSITIVE_INFINITY, rate: 0.8, cap: 1_600_000 },
]

/** 제95조의3 제1항 제1호. 부모가 각각 n개월일 때 1~6개월 상한. */
export const BOTH_CAPS_FIRST6 = [
  2_500_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000, 4_500_000,
] as const

function clampPay(amount: number, cap: number) {
  return Math.round(Math.min(cap, Math.max(PARENTAL_FLOOR, amount)))
}

function generalBand(month: number, bands: Band[]) {
  return bands.find((band) => month >= band.fromMonth && month <= band.toMonth) ?? bands[bands.length - 1]
}

function monthPay(ordinary: number, month: number, mode: ParentalMode, bothMonths: number) {
  if (mode === "both" && month <= 6) {
    const shared = Math.min(6, Math.max(0, Math.floor(bothMonths)))
    if (month <= shared) {
      return {
        rate: 1,
        cap: BOTH_CAPS_FIRST6[month - 1] ?? BOTH_CAPS_FIRST6[5],
        pay: clampPay(ordinary, BOTH_CAPS_FIRST6[month - 1] ?? BOTH_CAPS_FIRST6[5]),
      }
    }
  }
  const band = generalBand(month, mode === "single" ? SINGLE_BANDS : GENERAL_BANDS)
  return {
    rate: band.rate,
    cap: band.cap,
    pay: clampPay(ordinary * band.rate, band.cap),
  }
}

export function calcParentalLeave(input: {
  monthlyOrdinary: number
  months: number
  mode?: ParentalMode
  /** 맞돌봄일 때 부모 각각 사용한 개월. 없으면 본인 개월. */
  bothMonths?: number
}) {
  if (input.monthlyOrdinary <= 0) return null
  const months = Math.max(0, Math.floor(input.months))
  if (months <= 0) return null
  const mode = input.mode ?? "general"
  const bothMonths = input.bothMonths ?? months
  const rows = Array.from({ length: months }, (_, index) => {
    const month = index + 1
    const row = monthPay(input.monthlyOrdinary, month, mode, bothMonths)
    return { month, ...row }
  })
  const total = rows.reduce((sum, row) => sum + row.pay, 0)
  return {
    mode,
    months,
    monthlyOrdinary: input.monthlyOrdinary,
    firstMonth: rows[0]?.pay ?? 0,
    lastMonth: rows[rows.length - 1]?.pay ?? 0,
    total,
    rows,
  }
}
