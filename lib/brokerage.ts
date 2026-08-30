/** 공인중개사법 시행규칙 별표 1·2 · 제20조 (법제처 2026-08-28 시행분) */
export type DealType = "sale" | "jeonse" | "wolse"
export type PropertyType = "house" | "officetel" | "presale" | "other"

type Band = { max: number; rate: number; cap: number | null }

const HOUSE_SALE: Band[] = [
  { max: 50_000_000, rate: 0.006, cap: 250_000 },
  { max: 200_000_000, rate: 0.005, cap: 800_000 },
  { max: 900_000_000, rate: 0.004, cap: null },
  { max: 1_200_000_000, rate: 0.005, cap: null },
  { max: 1_500_000_000, rate: 0.006, cap: null },
  { max: Infinity, rate: 0.007, cap: null },
]

const HOUSE_LEASE: Band[] = [
  { max: 50_000_000, rate: 0.005, cap: 200_000 },
  { max: 100_000_000, rate: 0.004, cap: 300_000 },
  { max: 600_000_000, rate: 0.003, cap: null },
  { max: 1_200_000_000, rate: 0.004, cap: null },
  { max: 1_500_000_000, rate: 0.005, cap: null },
  { max: Infinity, rate: 0.006, cap: null },
]

export function monthlyDealAmount(deposit: number, monthly: number): number {
  const first = deposit + monthly * 100
  if (first < 50_000_000) return deposit + monthly * 70
  return first
}

function pickBand(amount: number, table: Band[]): Band {
  return table.find((band) => amount < band.max) ?? table[table.length - 1]
}

function applyBand(amount: number, band: Band) {
  const raw = amount * band.rate
  const fee = band.cap === null ? raw : Math.min(raw, band.cap)
  return { fee, rate: band.rate, cap: band.cap }
}

export function calcBrokerage(input: {
  deal: DealType
  property: PropertyType
  price: number
  monthlyRent?: number
  paid?: number
  premium?: number
  includeVat: boolean
}) {
  const isLease = input.deal !== "sale"
  let amount = input.price

  if (input.deal === "wolse") {
    amount = monthlyDealAmount(input.price, input.monthlyRent ?? 0)
  }

  if (input.property === "presale") {
    amount = (input.paid ?? 0) + (input.premium ?? 0)
  }

  let rate: number
  let cap: number | null
  let fee: number
  let rule: string

  if (input.property === "officetel") {
    rate = isLease ? 0.004 : 0.005
    cap = null
    fee = amount * rate
    rule = isLease ? "주거용 오피스텔 임대 상한 0.4%" : "주거용 오피스텔 매매 상한 0.5%"
  } else if (input.property === "other") {
    rate = 0.009
    cap = null
    fee = amount * rate
    rule = "상가·토지 등 기타 부동산 상한 0.9%"
  } else {
    const table = isLease ? HOUSE_LEASE : HOUSE_SALE
    const applied = applyBand(amount, pickBand(amount, table))
    fee = applied.fee
    rate = applied.rate
    cap = applied.cap
    rule = isLease ? "주택 임대차 상한요율" : "주택 매매 상한요율"
  }

  const vat = input.includeVat ? fee * 0.1 : 0
  const total = fee + vat

  return {
    amount,
    rate,
    cap,
    fee,
    vat,
    total,
    rule,
    note: "법정 상한이며, 실제 지급액은 이 안에서 협의합니다. 매매는 매수·매도, 임대차는 임대인·임차인이 각자 내는 것이 원칙입니다.",
  }
}
