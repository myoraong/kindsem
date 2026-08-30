/** 근로기준법 제56조. 추정 시세는 넣지 않습니다. */

import { monthlyContractHours } from "./labor.ts"
import { OVERTIME_STATUTE } from "./policy.generated.ts"

/** 연장근로 가산 포함 지급률. 통상임금 + 100분의 50. */
export const OVERTIME_RATE = 1 + OVERTIME_STATUTE.overtimePremium
/** 야간근로(22:00–06:00) 가산만. 통상임금의 100분의 50. */
export const NIGHT_PREMIUM_RATE = OVERTIME_STATUTE.nightPremium
/** 휴일근로 8시간 이내. 통상임금 + 100분의 50. */
export const HOLIDAY_RATE = 1 + OVERTIME_STATUTE.holidayPremium
/** 휴일근로 8시간 초과. 통상임금 + 100분의 100. */
export const HOLIDAY_OVER_RATE = 1 + OVERTIME_STATUTE.holidayOverPremium
export const HOLIDAY_SPLIT_HOURS = OVERTIME_STATUTE.holidaySplitHours

export function ordinaryHourlyFromMonthly(monthlyOrdinary: number, weeklyHours: number) {
  const hours = monthlyContractHours(weeklyHours)
  if (monthlyOrdinary <= 0 || hours <= 0) return 0
  return monthlyOrdinary / hours
}

/**
 * 연장·야간·휴일 시간을 각각 넣습니다.
 * 연장·휴일은 해당 시간의 통상임금을 포함한 지급액이고, 야간은 가산만입니다.
 * 같은 시간을 연장과 휴일에 겹쳐 넣으면 통상임금이 두 번 잡힙니다.
 */
export function calcOvertimePay(input: {
  hourlyWage: number
  overtimeHours: number
  nightHours: number
  holidayHours: number
}) {
  if (input.hourlyWage <= 0) return null
  const overtimeHours = Math.max(0, input.overtimeHours)
  const nightHours = Math.max(0, input.nightHours)
  const holidayHours = Math.max(0, input.holidayHours)
  if (overtimeHours === 0 && nightHours === 0 && holidayHours === 0) return null

  const overtimePay = Math.round(input.hourlyWage * OVERTIME_RATE * overtimeHours)
  const nightPremium = Math.round(input.hourlyWage * NIGHT_PREMIUM_RATE * nightHours)
  const holidayWithin = Math.min(holidayHours, HOLIDAY_SPLIT_HOURS)
  const holidayOver = Math.max(0, holidayHours - HOLIDAY_SPLIT_HOURS)
  const holidayPay = Math.round(
    input.hourlyWage * HOLIDAY_RATE * holidayWithin +
      input.hourlyWage * HOLIDAY_OVER_RATE * holidayOver,
  )
  return {
    hourlyWage: input.hourlyWage,
    overtimeHours,
    nightHours,
    holidayHours,
    overtimePay,
    nightPremium,
    holidayPay,
    holidayWithin,
    holidayOver,
    total: overtimePay + nightPremium + holidayPay,
  }
}
