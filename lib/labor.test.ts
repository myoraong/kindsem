import assert from "node:assert/strict"
import test from "node:test"
import {
  calcAnnualLeave,
  calcPartTimeMonth,
  calcSeverance,
  calcWeeklyHoliday,
  MONTH_HOURS_FACTOR,
  monthlyContractHours,
  statutoryLeaveDays,
} from "./labor.ts"

test("주 40시간이면 주휴 8시간, 시급×8", () => {
  const result = calcWeeklyHoliday({ hourlyWage: 10_000, weeklyHours: 40, attended: true })
  assert.ok(result)
  assert.equal(result.holidayHours, 8)
  assert.equal(result.holidayPay, 80_000)
  assert.equal(result.workPay, 400_000)
})

test("주 20시간이면 주휴 4시간", () => {
  const result = calcWeeklyHoliday({ hourlyWage: 10_000, weeklyHours: 20, attended: true })
  assert.ok(result)
  assert.equal(result.holidayHours, 4)
  assert.equal(result.holidayPay, 40_000)
})

test("주 15시간 미만이면 주휴수당이 없다", () => {
  const result = calcWeeklyHoliday({ hourlyWage: 10_000, weeklyHours: 14, attended: true })
  assert.ok(result)
  assert.equal(result.eligible, false)
  assert.equal(result.holidayPay, 0)
})

test("개근하지 않은 주는 주휴수당이 없다", () => {
  const result = calcWeeklyHoliday({ hourlyWage: 10_000, weeklyHours: 40, attended: false })
  assert.ok(result)
  assert.equal(result.holidayPay, 0)
})

test("연차 일수는 제60조 표와 같다", () => {
  assert.equal(statutoryLeaveDays({ years: 0.5, attendedMonths: 6 }), 6)
  assert.equal(statutoryLeaveDays({ years: 1 }), 15)
  assert.equal(statutoryLeaveDays({ years: 2 }), 15)
  assert.equal(statutoryLeaveDays({ years: 3 }), 16)
  assert.equal(statutoryLeaveDays({ years: 21 }), 25)
  assert.equal(statutoryLeaveDays({ years: 30 }), 25)
})

test("주 20시간 단시간은 15일에 비례한다", () => {
  assert.equal(statutoryLeaveDays({ years: 1, weeklyHours: 20 }), 7.5)
})

test("주 15시간 미만은 연차가 없다", () => {
  assert.equal(statutoryLeaveDays({ years: 1, weeklyHours: 14 }), 0)
})

test("미사용 연차수당은 1일 통상임금×일수", () => {
  const monthly = 10_000 * monthlyContractHours(40)
  const result = calcAnnualLeave({
    years: 1,
    weeklyHours: 40,
    weeklyDays: 5,
    monthlyOrdinary: monthly,
    unusedDays: 15,
  })
  assert.equal(result.days, 15)
  assert.equal(result.dailyWage, 80_000)
  assert.equal(result.allowance, 1_200_000)
})

test("퇴직금은 평균임금×30×근속연수, 1년 미만은 의무 없음", () => {
  const year = calcSeverance({ wage3m: 9_000_000, days3m: 90, serviceDays: 365 })
  assert.ok(year)
  assert.equal(year.eligible, true)
  assert.equal(year.averageDaily, 100_000)
  assert.equal(year.amount, 3_000_000)

  const short = calcSeverance({ wage3m: 9_000_000, days3m: 90, serviceDays: 180 })
  assert.ok(short)
  assert.equal(short.eligible, false)
})

test("시급 1만·주 20시간이면 월 근로+주휴는 시행령 환산 시간과 같다", () => {
  const result = calcPartTimeMonth({ hourlyWage: 10_000, weeklyHours: 20, attended: true })
  assert.ok(result)
  assert.equal(result.holidayHours, 4)
  assert.equal(result.monthWork, Math.round(10_000 * 20 * MONTH_HOURS_FACTOR))
  assert.equal(result.monthHoliday, Math.round(10_000 * 4 * MONTH_HOURS_FACTOR))
  assert.equal(result.monthTotal, result.monthWork + result.monthHoliday)
})

test("평균임금보다 통상임금이 크면 통상임금을 쓴다", () => {
  const result = calcSeverance({
    wage3m: 9_000_000,
    days3m: 90,
    serviceDays: 365,
    dailyOrdinary: 120_000,
  })
  assert.ok(result)
  assert.equal(result.usedLabel, "통상임금")
  assert.equal(result.amount, 3_600_000)
})
