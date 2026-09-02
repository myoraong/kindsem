import { truncWon } from "./format.ts"
import { ACQUISITION, STAMP } from "./policy.generated.ts"

export type HomeCount = "1" | "2" | "3" | "4+"

/** 지방세법 제11조제1항제8호. 6~9억은 소수 다섯째 자리 반올림 */
export function standardHousingRate(price: number): number {
  if (price <= ACQUISITION.housingMidFrom) return ACQUISITION.housingLow
  if (price > ACQUISITION.housingMidTo) return ACQUISITION.housingHigh
  const span = ACQUISITION.housingMidTo - ACQUISITION.housingMidFrom
  const percent = (price * 2) / span - 3
  return Math.round(percent * 10_000) / 10_000 / 100
}

/**
 * 지방세법 제13조의2
 * 중과 = 제11조1항7호나목 + 중과기준세율 × 200 또는 400
 */
export function housingAcquisitionRate(input: {
  homeCount: HomeCount
  adjustedArea: boolean
}): { rate: number; heavy: boolean; label: string } {
  if (input.homeCount === "1") {
    return { rate: 0, heavy: false, label: "1주택 일반세율 1~3%" }
  }
  if (input.homeCount === "2") {
    if (input.adjustedArea) {
      return {
        rate: ACQUISITION.heavy2,
        heavy: true,
        label: `조정대상지역 2주택 중과 ${Math.round(ACQUISITION.heavy2 * 100)}%`,
      }
    }
    return { rate: 0, heavy: false, label: "비조정 2주택 일반세율 1~3%" }
  }
  if (input.homeCount === "3") {
    if (input.adjustedArea) {
      return {
        rate: ACQUISITION.heavy3,
        heavy: true,
        label: `조정대상지역 3주택 중과 ${Math.round(ACQUISITION.heavy3 * 100)}%`,
      }
    }
    return {
      rate: ACQUISITION.heavy2,
      heavy: true,
      label: `비조정 3주택 중과 ${Math.round(ACQUISITION.heavy2 * 100)}%`,
    }
  }
  return {
    rate: ACQUISITION.heavy3,
    heavy: true,
    label: input.adjustedArea
      ? `조정대상지역 4주택 이상 중과 ${Math.round(ACQUISITION.heavy3 * 100)}%`
      : `비조정 4주택 이상 중과 ${Math.round(ACQUISITION.heavy3 * 100)}%`,
  }
}

export function calcAcquisition(input: {
  price: number
  homeCount: HomeCount
  adjustedArea: boolean
  over85: boolean
  firstHome: boolean
  shrinkingArea?: boolean
}) {
  const policy = housingAcquisitionRate({
    homeCount: input.homeCount,
    adjustedArea: input.adjustedArea,
  })
  const rate = policy.heavy ? policy.rate : standardHousingRate(input.price)
  const baseTax = truncWon(input.price * rate)

  const reliefCap = input.shrinkingArea ? ACQUISITION.shrinkingRelief : ACQUISITION.firstHomeRelief
  const firstHomeRelief =
    input.firstHome && input.homeCount === "1" && input.price <= ACQUISITION.firstHomeLimit
      ? Math.min(baseTax, reliefCap)
      : 0

  const acquisitionTax = Math.max(0, baseTax - firstHomeRelief)
  const educationTax = policy.heavy
    ? truncWon(input.price * ACQUISITION.educationHeavyFixed)
    : truncWon(acquisitionTax * ACQUISITION.educationShare)
  const ruralRate = policy.heavy
    ? policy.rate >= ACQUISITION.heavy3
      ? ACQUISITION.ruralHeavy3
      : ACQUISITION.ruralHeavy2
    : ACQUISITION.ruralNormal
  const ruralTax = input.over85 ? truncWon(input.price * ruralRate) : 0

  const total = acquisitionTax + educationTax + ruralTax

  return {
    rate,
    policyLabel: policy.label,
    baseTax,
    firstHomeRelief,
    acquisitionTax,
    educationTax,
    ruralTax,
    total,
  }
}

/** 인지세법 제3조(이하 포함) · 제6조 주택 1억 이하 비과세 */
export function stampDuty(price: number, isHousingDeed: boolean): number {
  if (isHousingDeed && price <= STAMP.housingExempt) return 0
  if (price <= 10_000_000) return 0
  for (const band of STAMP.bands) {
    if (price <= band.upTo) return band.duty
  }
  return STAMP.bands[STAMP.bands.length - 1].duty
}
