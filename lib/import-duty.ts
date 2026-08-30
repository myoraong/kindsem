/**
 * 관세청 특송물품 통관 · 관세법 제94조 소액면세 · 부가가치세법 제20조·제30조.
 * HS별 관세율은 넣지 않습니다. 관세는 사용자가 넣은 금액·세율만 씁니다.
 */

import { VAT_RATE } from "./policy.generated.ts"

export const LIST_CLEARANCE_USD = 150
export const LIST_CLEARANCE_US_USD = 200
export const DE_MINIMIS_USD = 150

export type ImportOrigin = "other" | "us"

export function listClearanceLimitUsd(origin: ImportOrigin, excluded: boolean) {
  if (excluded) return 0
  return origin === "us" ? LIST_CLEARANCE_US_USD : LIST_CLEARANCE_USD
}

export function calcImportDuty(input: {
  priceUsd: number
  fxKrw: number
  origin: ImportOrigin
  listExcluded: boolean
  dutyWon?: number
  dutyRate?: number
}) {
  if (input.priceUsd <= 0) return null
  const listLimit = listClearanceLimitUsd(input.origin, input.listExcluded)
  const listEligible = listLimit > 0 && input.priceUsd <= listLimit
  const deMinimis = input.priceUsd <= DE_MINIMIS_USD
  const goodsKrw = input.fxKrw > 0 ? Math.round(input.priceUsd * input.fxKrw) : null

  if (listEligible) {
    return {
      listEligible: true,
      deMinimis,
      taxed: false,
      taxFree: "list" as const,
      listLimit,
      goodsKrw,
      duty: 0,
      vat: 0,
      totalTax: 0,
      landed: goodsKrw,
      hsUnknown: false,
    }
  }

  if (deMinimis) {
    return {
      listEligible: false,
      deMinimis: true,
      taxed: false,
      taxFree: "de-minimis" as const,
      listLimit,
      goodsKrw,
      duty: 0,
      vat: 0,
      totalTax: 0,
      landed: goodsKrw,
      hsUnknown: false,
    }
  }

  const enteredDuty = input.dutyWon != null && input.dutyWon >= 0 ? Math.round(input.dutyWon) : null
  const ratedDuty =
    goodsKrw != null && input.dutyRate != null && input.dutyRate >= 0
      ? Math.round(goodsKrw * input.dutyRate)
      : null
  const duty = enteredDuty ?? ratedDuty
  const hsUnknown = duty == null
  const vat = goodsKrw != null && duty != null ? Math.round((goodsKrw + duty) * VAT_RATE) : null
  const totalTax = duty != null && vat != null ? duty + vat : null
  const landed = goodsKrw != null && totalTax != null ? goodsKrw + totalTax : null

  return {
    listEligible: false,
    deMinimis: false,
    taxed: true,
    taxFree: null,
    listLimit,
    goodsKrw,
    duty,
    vat,
    totalTax,
    landed,
    hsUnknown,
  }
}
