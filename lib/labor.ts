import { LABOR_STATUTE } from "./policy.generated.ts"

/** 근로기준법·근로자퇴직급여 보장법. 추정 시세는 넣지 않습니다. */

export const WEEKLY_FULL_HOURS = LABOR_STATUTE.weeklyFullHours
export const WEEKLY_HOLIDAY_HOURS_FULL = LABOR_STATUTE.dailyHours
export const SHORT_HOUR_THRESHOLD = LABOR_STATUTE.shortHourThreshold
export const ANNUAL_LEAVE_BASE = LABOR_STATUTE.annualLeaveBase
export const ANNUAL_LEAVE_CAP = LABOR_STATUTE.annualLeaveCap
export const SEVERANCE_DAYS = LABOR_STATUTE.severanceDays

/** 최저임금법 시행령 제5조 월 환산 기준시간. (주소정 + 유급주휴) × 365/7 ÷ 12 */
export const MONTH_HOURS_FACTOR = 365 / 7 / 12

export function weeklyHolidayHours(weeklyHours: number) {
  if (weeklyHours < SHORT_HOUR_THRESHOLD) return 0
  return WEEKLY_HOLIDAY_HOURS_FULL * (Math.min(weeklyHours, WEEKLY_FULL_HOURS) / WEEKLY_FULL_HOURS)
}

export function monthlyContractHours(weeklyHours: number) {
  return (weeklyHours + weeklyHolidayHours(weeklyHours)) * MONTH_HOURS_FACTOR
}

export function calcWeeklyHoliday(input: {
  hourlyWage: number
  weeklyHours: number
  attended: boolean
}) {
  if (input.hourlyWage <= 0 || input.weeklyHours <= 0) return null
  const holidayHours = input.attended ? weeklyHolidayHours(input.weeklyHours) : 0
  const workPay = Math.round(input.hourlyWage * input.weeklyHours)
  const holidayPay = Math.round(input.hourlyWage * holidayHours)
  const monthHoliday = Math.round(input.hourlyWage * holidayHours * MONTH_HOURS_FACTOR)
  return {
    eligible: input.weeklyHours >= SHORT_HOUR_THRESHOLD,
    holidayHours,
    workPay,
    holidayPay,
    weeklyTotal: workPay + holidayPay,
    monthHoliday,
    monthlyHours: monthlyContractHours(input.weeklyHours),
  }
}

/** 시급제 알바 월급. 월 환산은 최저임금법 시행령 제5조 시간과 같습니다. */
export function calcPartTimeMonth(input: {
  hourlyWage: number
  weeklyHours: number
  attended: boolean
}) {
  const weekly = calcWeeklyHoliday(input)
  if (!weekly) return null
  const monthWork = Math.round(input.hourlyWage * input.weeklyHours * MONTH_HOURS_FACTOR)
  const monthHoliday = Math.round(input.hourlyWage * weekly.holidayHours * MONTH_HOURS_FACTOR)
  return {
    ...weekly,
    monthWork,
    monthHoliday,
    monthTotal: monthWork + monthHoliday,
  }
}

/**
 * 근로기준법 제60조.
 * 1년 미만: 1개월 개근 시 1일.
 * 1년 이상 80% 출근: 15일 + 1년 초과 근속 매 2년 1일, 한도 25일.
 * 단시간: 기간제 및 단시간근로자 보호 등에 관한 법률 제6조 비례.
 */
export function statutoryLeaveDays(input: {
  years: number
  attendedMonths?: number
  weeklyHours?: number
}) {
  if (input.years < 0) return 0
  let days: number
  if (input.years < 1) {
    days = Math.min(11, Math.max(0, Math.floor(input.attendedMonths ?? 0)))
  } else {
    days = Math.min(
      ANNUAL_LEAVE_CAP,
      ANNUAL_LEAVE_BASE + Math.floor((input.years - 1) / 2),
    )
  }
  const weekly = input.weeklyHours ?? WEEKLY_FULL_HOURS
  if (weekly < SHORT_HOUR_THRESHOLD) return 0
  if (weekly < WEEKLY_FULL_HOURS) {
    return Math.round(days * (weekly / WEEKLY_FULL_HOURS) * 10) / 10
  }
  return days
}

export function dailyOrdinaryWage(input: {
  monthlyOrdinary: number
  weeklyHours: number
  weeklyDays: number
}) {
  if (input.monthlyOrdinary <= 0 || input.weeklyHours <= 0 || input.weeklyDays <= 0) return 0
  const monthHours = monthlyContractHours(input.weeklyHours)
  if (monthHours <= 0) return 0
  const dayHours = input.weeklyHours / input.weeklyDays
  return Math.round((input.monthlyOrdinary / monthHours) * dayHours)
}

export function calcAnnualLeave(input: {
  years: number
  attendedMonths?: number
  weeklyHours: number
  weeklyDays: number
  monthlyOrdinary: number
  unusedDays: number
}) {
  const days = statutoryLeaveDays({
    years: input.years,
    attendedMonths: input.attendedMonths,
    weeklyHours: input.weeklyHours,
  })
  const daily = dailyOrdinaryWage({
    monthlyOrdinary: input.monthlyOrdinary,
    weeklyHours: input.weeklyHours,
    weeklyDays: input.weeklyDays,
  })
  const unused = Math.max(0, input.unusedDays)
  const allowance = unused > 0 && daily > 0 ? unused * daily : 0
  return {
    days,
    dailyWage: daily,
    unused,
    allowance,
    eligible: (input.weeklyHours ?? 0) >= SHORT_HOUR_THRESHOLD,
  }
}

function daysInclusive(from: Date, to: Date) {
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.floor((end - start) / 86_400_000) + 1
}

export function serviceDays(from: Date, to: Date) {
  return daysInclusive(from, to)
}

/**
 * 근로자퇴직급여 보장법 제8조 · 제4조.
 * 퇴직금 = 평균임금 × 30일 × (근속일수 / 365).
 * 평균임금 < 통상임금이면 통상임금 (근로기준법 제2조 제1항 제6호 단서).
 * 계속근로 1년 미만은 법정 의무 없음.
 */
export function calcSeverance(input: {
  wage3m: number
  days3m: number
  serviceDays: number
  dailyOrdinary?: number
}) {
  if (input.wage3m <= 0 || input.days3m <= 0 || input.serviceDays <= 0) return null
  const avg = input.wage3m / input.days3m
  const ordinary = input.dailyOrdinary ?? 0
  const used = ordinary > avg ? ordinary : avg
  const usedLabel = ordinary > avg ? "통상임금" : "평균임금"
  const years = input.serviceDays / 365
  const amount = Math.round(used * SEVERANCE_DAYS * years)
  return {
    eligible: input.serviceDays >= 365,
    averageDaily: avg,
    ordinaryDaily: ordinary,
    usedDaily: used,
    usedLabel,
    years,
    amount,
  }
}
