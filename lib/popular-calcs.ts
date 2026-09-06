import { getCalculator, type CalcItem } from "./catalog.ts"

/**
 * 홈·검색창의 「자주 찾는 계산기」고정 목록.
 * 방문자 수·Search Console 순위가 아닙니다. 검색으로 들어올 법한 계산기를
 * 편집해서 둔 것이고, 실제 유입 집계가 생기면 그때 바꿉니다.
 */
export const POPULAR_SLUGS = [
  "take-home",
  "weekly-holiday",
  "severance",
  "acquisition",
  "brokerage",
  "dutch",
  "dsr",
  "gift-tax",
] as const

export function popularCalculators(): CalcItem[] {
  return POPULAR_SLUGS.map((slug) => getCalculator(slug)).filter(
    (item): item is CalcItem => Boolean(item),
  )
}
