import assert from "node:assert/strict"
import test from "node:test"
import { MIN_WAGE } from "./policy.generated.ts"
import { monthlyContractHours } from "./labor.ts"
import { calcMinWage, statutoryMonthly } from "./min-wage.ts"

test("주 40시간 월 최저는 고시 209시간·월급과 같다", () => {
  assert.equal(MIN_WAGE.hourly * MIN_WAGE.monthlyHours, MIN_WAGE.monthly)
  assert.equal(statutoryMonthly(40), MIN_WAGE.monthly)
  const result = calcMinWage({ weeklyHours: 40, hourlyWage: MIN_WAGE.hourly })
  assert.ok(result)
  assert.equal(result.monthlyHours, 209)
  assert.equal(result.floorMonthly, MIN_WAGE.monthly)
  assert.equal(result.meetsHourly, true)
  assert.equal(result.dailyFull, MIN_WAGE.hourly * 8)
})

test("시급을 넣으면 월 환산이 나온다", () => {
  const result = calcMinWage({ weeklyHours: 40, hourlyWage: 100_000 })
  assert.ok(result)
  assert.equal(result.userHourly, 100_000)
  assert.equal(result.userMonthly, 20_900_000)
})

test("월급을 넣으면 시급 환산이 나온다", () => {
  const result = calcMinWage({ weeklyHours: 40, monthlyWage: MIN_WAGE.monthly })
  assert.ok(result)
  assert.equal(result.userMonthly, MIN_WAGE.monthly)
  assert.equal(Math.round(result.userHourly), MIN_WAGE.hourly)
  assert.equal(result.meetsHourly, true)
})

test("고시 시급보다 낮으면 미달이다", () => {
  const result = calcMinWage({ weeklyHours: 40, hourlyWage: MIN_WAGE.hourly - 1 })
  assert.ok(result)
  assert.equal(result.meetsHourly, false)
})

test("주 20시간은 시행령 제5조 월 시간으로 환산한다", () => {
  const result = calcMinWage({ weeklyHours: 20, hourlyWage: MIN_WAGE.hourly })
  assert.ok(result)
  assert.equal(result.holidayHours, 4)
  assert.equal(result.monthlyHours, monthlyContractHours(20))
  assert.equal(result.floorMonthly, Math.round(MIN_WAGE.hourly * monthlyContractHours(20)))
  assert.notEqual(result.monthlyHours, 209)
})
