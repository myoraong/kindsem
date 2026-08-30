import assert from "node:assert/strict"
import test from "node:test"
import { calcProratePay, daysInMonth, monthDaysFor } from "./prorate-pay.ts"

test("2월 2026년은 28일이다", () => {
  assert.equal(daysInMonth(2026, 1), 28)
  assert.equal(monthDaysFor("thirty", 2026, 1), 30)
  assert.equal(monthDaysFor("calendar", 2026, 0), 31)
})

test("달력일로 월급을 나눈 뒤 근무일을 곱한다", () => {
  const result = calcProratePay({ monthly: 3_000_000, workDays: 10, monthDays: 30 })
  assert.ok(result)
  assert.equal(result.daily, 100_000)
  assert.equal(result.amount, 1_000_000)
})

test("0원·0일은 계산하지 않는다", () => {
  assert.equal(calcProratePay({ monthly: 0, workDays: 10, monthDays: 30 }), null)
  assert.equal(calcProratePay({ monthly: 1_000_000, workDays: 0, monthDays: 30 }), null)
})
