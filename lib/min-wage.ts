import { MIN_WAGE } from "./policy.generated.ts"
import { monthlyContractHours, weeklyHolidayHours } from "./labor.ts"

/** 주 40시간은 고시 209시간, 그 외는 최저임금법 시행령 제5조. */
export function minWageMonthHours(weeklyHours: number) {
  if (weeklyHours === MIN_WAGE.weeklyHours) return MIN_WAGE.monthlyHours
  return monthlyContractHours(weeklyHours)
}

export function statutoryMonthly(weeklyHours: number) {
  if (weeklyHours === MIN_WAGE.weeklyHours) return MIN_WAGE.monthly
  return Math.round(MIN_WAGE.hourly * monthlyContractHours(weeklyHours))
}

export function calcMinWage(input: {
  hourlyWage?: number
  monthlyWage?: number
  weeklyHours: number
}) {
  if (input.weeklyHours <= 0) return null
  const hours = minWageMonthHours(input.weeklyHours)
  const floorMonthly = statutoryMonthly(input.weeklyHours)
  const holidayHours = weeklyHolidayHours(input.weeklyHours)
  const userHourly =
    input.hourlyWage && input.hourlyWage > 0
      ? input.hourlyWage
      : input.monthlyWage && input.monthlyWage > 0 && hours > 0
        ? input.monthlyWage / hours
        : 0
  const userMonthly =
    input.monthlyWage && input.monthlyWage > 0
      ? input.monthlyWage
      : userHourly > 0
        ? Math.round(userHourly * hours)
        : 0
  return {
    year: MIN_WAGE.year,
    hourly: MIN_WAGE.hourly,
    monthlyFull: MIN_WAGE.monthly,
    monthlyHours: hours,
    holidayHours,
    floorMonthly,
    dailyFull: MIN_WAGE.hourly * MIN_WAGE.weeklyHolidayHours,
    userHourly,
    userMonthly,
    meetsHourly: userHourly <= 0 ? null : userHourly + 1e-9 >= MIN_WAGE.hourly,
    meetsMonthly: userMonthly <= 0 ? null : userMonthly + 1e-9 >= floorMonthly,
    hourlyGap: userHourly > 0 ? userHourly - MIN_WAGE.hourly : 0,
    monthlyGap: userMonthly > 0 ? userMonthly - floorMonthly : 0,
  }
}
