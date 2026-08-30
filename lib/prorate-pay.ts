/** 월급 일할. 근로기준법은 산정 방식을 하나로 정하지 않아, 달력일·30일만 고르게 합니다. */

export type ProrateMethod = "calendar" | "thirty"

export function daysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate()
}

export function calcProratePay(input: {
  monthly: number
  workDays: number
  monthDays: number
}) {
  if (input.monthly <= 0 || input.workDays <= 0 || input.monthDays <= 0) return null
  const daily = input.monthly / input.monthDays
  return {
    daily,
    amount: Math.round(daily * input.workDays),
    workDays: input.workDays,
    monthDays: input.monthDays,
  }
}

export function monthDaysFor(method: ProrateMethod, year: number, monthIndex0: number) {
  return method === "thirty" ? 30 : daysInMonth(year, monthIndex0)
}
