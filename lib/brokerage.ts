import { truncWon } from "./format.ts"
import { BROKERAGE, BROKERAGE_LEASE, BROKERAGE_SALE, VAT_RATE } from "./policy.generated.ts"

export type DealType = "sale" | "jeonse" | "wolse"
export type PropertyType = "house" | "officetel" | "presale" | "other"

type Band = { max: number; rate: number; cap: number | null }

export function monthlyDealAmount(deposit: number, monthly: number): number {
  const first = deposit + monthly * BROKERAGE.monthlyHighMultiple
  if (first < BROKERAGE.monthlyLowThreshold) {
    return deposit + monthly * BROKERAGE.monthlyLowMultiple
  }
  return first
}

function pickBand(amount: number, table: readonly Band[]): Band {
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
    rate = isLease ? BROKERAGE.officetelLease : BROKERAGE.officetelSale
    cap = null
    fee = amount * rate
    rule = isLease
      ? `주거용 오피스텔 임대 상한 ${(BROKERAGE.officetelLease * 100).toFixed(1)}%`
      : `주거용 오피스텔 매매 상한 ${(BROKERAGE.officetelSale * 100).toFixed(1)}%`
  } else if (input.property === "other") {
    rate = BROKERAGE.other
    cap = null
    fee = amount * rate
    rule = `상가·토지 등 기타 부동산 상한 ${(BROKERAGE.other * 100).toFixed(1)}%`
  } else {
    const table = isLease ? BROKERAGE_LEASE : BROKERAGE_SALE
    const applied = applyBand(amount, pickBand(amount, table))
    fee = applied.fee
    rate = applied.rate
    cap = applied.cap
    rule = isLease ? "주택 임대차 상한요율" : "주택 매매 상한요율"
  }

  const feeWon = truncWon(fee)
  const vat = input.includeVat ? truncWon(feeWon * VAT_RATE) : 0
  const total = feeWon + vat

  return {
    amount,
    rate,
    cap,
    fee: feeWon,
    vat,
    total,
    rule,
    note: "법정 상한이며, 실제 지급액은 이 안에서 협의합니다. 매매는 매수·매도, 임대차는 임대인·임차인이 각자 내는 것이 원칙입니다.",
  }
}
