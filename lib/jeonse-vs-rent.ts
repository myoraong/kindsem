/**
 * 주택임대차보호법 제7조의2 · 시행령 제9조 상한으로 전세와 월세를 한 장에서 비교.
 * 시세 전환율은 넣지 않습니다.
 */

import { statutoryConvertCap } from "./rent-convert.ts"

export function calcJeonseVsRent(input: {
  jeonse: number
  monthlyDeposit: number
  monthlyRent: number
  baseRate: number
  jeonseInterestMonthly?: number
}) {
  const cap = statutoryConvertCap(input.baseRate)
  if (cap === null) return null
  if (input.jeonse <= 0 && input.monthlyRent <= 0) return null
  const converted = Math.max(0, input.jeonse - input.monthlyDeposit)
  const monthlyCap = converted > 0 ? Math.round((converted * cap) / 12) : 0
  const monthlyRent = Math.max(0, input.monthlyRent)
  const overCap = converted > 0 && monthlyRent > monthlyCap
  const jeonseInterest = Math.max(0, input.jeonseInterestMonthly ?? 0)
  return {
    cap,
    converted,
    monthlyCap,
    monthlyRent,
    overCap,
    jeonseInterest,
    rentBurden: monthlyRent,
    jeonseBurden: jeonseInterest,
    rentMinusCap: monthlyRent - monthlyCap,
  }
}
