import assert from "node:assert/strict"
import test from "node:test"
import { monthlyContractHours } from "./labor.ts"
import { calcOvertimePay, ordinaryHourlyFromMonthly } from "./overtime.ts"

test("연장 1.5, 야간 가산 0.5, 휴일 8시간 1.5", () => {
  const result = calcOvertimePay({
    hourlyWage: 10_000,
    overtimeHours: 10,
    nightHours: 4,
    holidayHours: 8,
  })
  assert.ok(result)
  assert.equal(result.overtimePay, 150_000)
  assert.equal(result.nightPremium, 20_000)
  assert.equal(result.holidayPay, 120_000)
  assert.equal(result.total, 290_000)
})

test("휴일 8시간 초과분은 2.0", () => {
  const result = calcOvertimePay({
    hourlyWage: 10_000,
    overtimeHours: 0,
    nightHours: 0,
    holidayHours: 10,
  })
  assert.ok(result)
  assert.equal(result.holidayWithin, 8)
  assert.equal(result.holidayOver, 2)
  assert.equal(result.holidayPay, 160_000)
})

test("시간이 없으면 결과를 내지 않는다", () => {
  assert.equal(
    calcOvertimePay({ hourlyWage: 10_000, overtimeHours: 0, nightHours: 0, holidayHours: 0 }),
    null,
  )
})

test("월급을 월 소정시간으로 나누면 통상시급", () => {
  const monthly = 10_000 * monthlyContractHours(40)
  const hourly = ordinaryHourlyFromMonthly(monthly, 40)
  assert.ok(Math.abs(hourly - 10_000) < 1e-6)
})
