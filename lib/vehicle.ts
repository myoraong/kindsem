import { truncWon } from "./format.ts"
import { CAR_TAX, VEHICLE_ACQUISITION } from "./policy.generated.ts"

/**
 * 지방세법 제12조 제1항 제2호 표준세율.
 * 비영업용 승용 70/1000, 경자동차 40/1000, 그 밖의 비영업용 50/1000, 영업용 40/1000.
 * 지방교육세 제151조 제1항 제1호: (세율 − 1천분의 20) × 100분의 20.
 * 경형 감면: 지방세특례제한법 제67조, 2027.12.31.까지 75만 원.
 */
export const VEHICLE_RATES = {
  passenger: VEHICLE_ACQUISITION.passenger,
  compact: VEHICLE_ACQUISITION.compact,
  otherPrivate: VEHICLE_ACQUISITION.otherPrivate,
  commercial: VEHICLE_ACQUISITION.commercial,
} as const

export type VehicleKind = keyof typeof VEHICLE_RATES

export const EDUCATION_RATE_OFFSET = VEHICLE_ACQUISITION.educationOffset
export const EDUCATION_SHARE = VEHICLE_ACQUISITION.educationShare
export const COMPACT_RELIEF = VEHICLE_ACQUISITION.compactRelief
export const COMPACT_RELIEF_UNTIL = VEHICLE_ACQUISITION.compactUntil

export function vehicleEducationRate(acqRate: number) {
  return Math.max(0, acqRate - EDUCATION_RATE_OFFSET) * EDUCATION_SHARE
}

/**
 * 지방세법 제127조 제1항 제1호·제2호·제3호, 제151조 제1항 제7호.
 * 비영업 승용: cc×시시당 세액, 차령 3년부터 기분세액 5%씩(12년 50%).
 * 그 밖의 승용(전기 등 배기량 없음) 비영업 10만 원. 지방교육세는 자동차세액의 30%.
 */
export const CAR_TAX_PRIVATE = CAR_TAX.private
export const CAR_TAX_COMMERCIAL = CAR_TAX.commercial
export const CAR_TAX_EV_PRIVATE = CAR_TAX.evPrivate
export const CAR_TAX_EDUCATION = CAR_TAX.education

export type CarTaxKind = "private" | "commercial" | "ev"

function perCcRate(cc: number, table: readonly { maxCc: number; perCc: number }[]) {
  const row = table.find((item) => cc <= item.maxCc)
  return row?.perCc ?? 0
}

export function carAgeReliefRate(ageYears: number) {
  if (ageYears < 3) return 0
  const n = Math.min(12, Math.floor(ageYears))
  return 0.05 * (n - 2)
}

export type CarPrepay = "none" | "jan" | "mar" | "jun" | "sep"

/** 지방세법 시행령 제125조 제6항. 연납 공제 이자율 100분의 5. 개정 2024. 12. 31. */
export const CAR_PREPAY_INTEREST = 0.05

const CAR_PREPAYS: readonly CarPrepay[] = ["none", "jan", "mar", "jun", "sep"]

export function asCarPrepay(value: string): CarPrepay {
  return CAR_PREPAYS.includes(value as CarPrepay) ? (value as CarPrepay) : "none"
}

export function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function inclusiveDays(year: number, startMonth: number, startDay: number, endMonth: number, endDay: number) {
  return (Date.UTC(year, endMonth, endDay) - Date.UTC(year, startMonth, startDay)) / 86_400_000 + 1
}

/**
 * 납부기한 다음 날부터 그 해 12월 31일까지.
 * 9월은 2기분만: 10월 1일–12월 31일 / 7월 1일–12월 31일.
 */
export function carPrepayFraction(year: number, prepay: Exclude<CarPrepay, "none">) {
  const yearDays = isLeapYear(year) ? 366 : 365
  if (prepay === "jan") return { numer: inclusiveDays(year, 1, 1, 11, 31), denom: yearDays }
  if (prepay === "mar") return { numer: inclusiveDays(year, 3, 1, 11, 31), denom: yearDays }
  if (prepay === "jun") return { numer: inclusiveDays(year, 6, 1, 11, 31), denom: yearDays }
  return {
    numer: inclusiveDays(year, 9, 1, 11, 31),
    denom: inclusiveDays(year, 6, 1, 11, 31),
  }
}

export function calcCarTax(input: {
  kind: CarTaxKind
  cc: number
  ageYears: number
  prepay?: CarPrepay
  year?: number
}) {
  if (input.kind !== "ev" && input.cc <= 0) return null
  const age = Math.max(0, input.ageYears)
  let raw = 0
  if (input.kind === "ev") {
    raw = CAR_TAX_EV_PRIVATE
  } else {
    const table = input.kind === "private" ? CAR_TAX_PRIVATE : CAR_TAX_COMMERCIAL
    raw = input.cc * perCcRate(input.cc, table)
  }
  const reliefRate = input.kind === "private" ? carAgeReliefRate(age) : 0
  const tax = Math.round(raw * (1 - reliefRate))
  const prepay = input.prepay ?? "none"
  const year = input.year ?? new Date().getFullYear()
  const fraction = prepay === "none" ? { numer: 0, denom: 1 } : carPrepayFraction(year, prepay)
  const base = prepay === "sep" ? Math.floor(tax / 2) : tax
  const discount =
    prepay === "none" ? 0 : truncWon((base * fraction.numer * CAR_PREPAY_INTEREST) / fraction.denom)
  const payableTax = base - discount
  const education = Math.round(payableTax * CAR_TAX_EDUCATION)
  const due = payableTax + education
  return {
    raw,
    reliefRate,
    tax,
    education,
    total: due,
    prepay,
    year,
    discount,
    payableTax,
    due,
    prepayNumer: fraction.numer,
    prepayDenom: fraction.denom,
    underPrepayMinimum: tax < 100_000,
  }
}

export function calcVehicleAcquisition(input: {
  base: number
  kind: VehicleKind
}) {
  if (input.base <= 0) return null
  const rate = VEHICLE_RATES[input.kind]
  const educationRate = vehicleEducationRate(rate)
  const rawAcq = Math.round(input.base * rate)
  const relief = input.kind === "compact" ? Math.min(rawAcq, COMPACT_RELIEF) : 0
  const acquisition = Math.max(0, rawAcq - relief)
  const reliefRatio = rawAcq > 0 ? relief / rawAcq : 0
  const rawEdu = Math.round(input.base * educationRate)
  const education = Math.round(rawEdu * (1 - reliefRatio))
  return {
    rate,
    educationRate,
    rawAcq,
    relief,
    acquisition,
    education,
    total: acquisition + education,
  }
}
