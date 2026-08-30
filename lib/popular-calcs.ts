import { getCalculator, type CalcItem } from "./catalog.ts"

/** 검색으로 자주 들어오는 계산기. 방문자 통계가 아니라 검색어 기준 고정 목록. */
export const POPULAR_SLUGS = [
  "take-home",
  "weekly-holiday",
  "acquisition",
  "brokerage",
  "dutch",
  "dsr",
] as const

export function popularCalculators(): CalcItem[] {
  return POPULAR_SLUGS.map((slug) => getCalculator(slug)).filter(
    (item): item is CalcItem => Boolean(item),
  )
}
