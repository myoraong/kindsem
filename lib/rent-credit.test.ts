import assert from "node:assert/strict"
import test from "node:test"
import { calcRentCredit } from "./rent-credit.ts"

test("무주택·총급여 5천만·월세 연 1,200만은 한도 1천만의 17%", () => {
  const result = calcRentCredit({
    annualRent: 12_000_000,
    totalSalary: 50_000_000,
    wageOnly: true,
    noHome: true,
  })
  assert.ok(result)
  assert.equal(result.eligible, true)
  if (result.eligible) {
    assert.equal(result.recognized, 10_000_000)
    assert.equal(result.rate, 0.17)
    assert.equal(result.credit, 1_700_000)
  }
})

test("총급여 7천만은 15%, 8천만 초과는 대상 아님", () => {
  const mid = calcRentCredit({
    annualRent: 10_000_000,
    totalSalary: 70_000_000,
    wageOnly: true,
    noHome: true,
  })
  assert.ok(mid?.eligible)
  if (mid?.eligible) {
    assert.equal(mid.rate, 0.15)
    assert.equal(mid.credit, 1_500_000)
  }
  const over = calcRentCredit({
    annualRent: 10_000_000,
    totalSalary: 81_000_000,
    wageOnly: true,
    noHome: true,
  })
  assert.ok(over)
  assert.equal(over.eligible, false)
})

test("주택이 있으면 공제하지 않는다", () => {
  const result = calcRentCredit({
    annualRent: 6_000_000,
    totalSalary: 40_000_000,
    wageOnly: true,
    noHome: false,
  })
  assert.ok(result)
  assert.equal(result.eligible, false)
})
