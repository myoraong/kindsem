/**
 * 지방세법 제12조 제1항 제2호 표준세율.
 * 비영업용 승용 70/1000, 경자동차 40/1000, 그 밖의 비영업용 50/1000, 영업용 40/1000.
 * 지방교육세 제151조 제1항 제1호: (세율 − 1천분의 20) × 100분의 20.
 * 경형 감면: 지방세특례제한법 제67조, 2027.12.31.까지 75만 원.
 */
export const VEHICLE_RATES = {
  passenger: 0.07,
  compact: 0.04,
  otherPrivate: 0.05,
  commercial: 0.04,
} as const

export type VehicleKind = keyof typeof VEHICLE_RATES

export const EDUCATION_RATE_OFFSET = 0.02
export const EDUCATION_SHARE = 0.2
export const COMPACT_RELIEF = 750_000
export const COMPACT_RELIEF_UNTIL = "2027-12-31"

export function vehicleEducationRate(acqRate: number) {
  return Math.max(0, acqRate - EDUCATION_RATE_OFFSET) * EDUCATION_SHARE
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
