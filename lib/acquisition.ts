export type HomeCount = "1" | "2" | "3" | "4+"

/** 지방세법 제11조제1항제8호. 6~9억은 소수 다섯째 자리 반올림 */
export function standardHousingRate(price: number): number {
  if (price <= 600_000_000) return 0.01
  if (price > 900_000_000) return 0.03
  const percent = (price * 2) / 300_000_000 - 3
  return Math.round(percent * 10_000) / 10_000 / 100
}

/**
 * 지방세법 제13조의2
 * 중과기준세율 2% + 제11조1항7호나목 4%
 * 8% = 4% + 2%×200, 12% = 4% + 2%×400
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
      return { rate: 0.08, heavy: true, label: "조정대상지역 2주택 중과 8%" }
    }
    return { rate: 0, heavy: false, label: "비조정 2주택 일반세율 1~3%" }
  }
  if (input.homeCount === "3") {
    if (input.adjustedArea) {
      return { rate: 0.12, heavy: true, label: "조정대상지역 3주택 중과 12%" }
    }
    return { rate: 0.08, heavy: true, label: "비조정 3주택 중과 8%" }
  }
  return {
    rate: 0.12,
    heavy: true,
    label: input.adjustedArea
      ? "조정대상지역 4주택 이상 중과 12%"
      : "비조정 4주택 이상 중과 12%",
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
  const baseTax = input.price * rate

  const reliefCap = input.shrinkingArea ? 3_000_000 : 2_000_000
  const firstHomeRelief =
    input.firstHome && input.homeCount === "1" && input.price <= 1_200_000_000
      ? Math.min(baseTax, reliefCap)
      : 0

  const acquisitionTax = Math.max(0, baseTax - firstHomeRelief)
  const educationTax = policy.heavy ? input.price * 0.004 : baseTax * 0.1
  const ruralTax = input.over85
    ? input.price * (policy.heavy ? (policy.rate >= 0.12 ? 0.01 : 0.006) : 0.002)
    : 0

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
  if (isHousingDeed && price <= 100_000_000) return 0
  if (price <= 10_000_000) return 0
  if (price <= 30_000_000) return 20_000
  if (price <= 50_000_000) return 40_000
  if (price <= 100_000_000) return 70_000
  if (price <= 1_000_000_000) return 150_000
  return 350_000
}

export function judicialEstimate(price: number): number {
  if (price < 300_000_000) return 300_000
  if (price < 600_000_000) return 500_000
  if (price < 900_000_000) return 800_000
  if (price < 1_500_000_000) return 1_100_000
  return 1_500_000
}
