import assert from "node:assert/strict"
import test from "node:test"
import { INTEREST_WITHHOLDING, afterInterestTax, calcDeposit } from "./deposit.ts"

test("이자소득 원천징수는 15.4%", () => {
  assert.equal(INTEREST_WITHHOLDING, 0.154)
  assert.equal(afterInterestTax(100_000), 84_600)
})

test("예금 단리 1년 10%는 원금의 10%", () => {
  const result = calcDeposit({
    kind: "savings",
    compound: "simple",
    principal: 1_000_000,
    annualRate: 10,
    months: 12,
  })
  assert.ok(result)
  assert.equal(result.principal, 1_000_000)
  assert.equal(result.grossInterest, 100_000)
  assert.equal(result.netInterest, 84_600)
  assert.equal(result.grossTotal, 1_100_000)
})

test("적금 단리는 잔여 개월 합으로 이자를 낸다", () => {
  const result = calcDeposit({
    kind: "installment",
    compound: "simple",
    principal: 0,
    monthly: 100_000,
    annualRate: 12,
    months: 12,
  })
  assert.ok(result)
  assert.equal(result.principal, 1_200_000)
  assert.equal(result.grossInterest, 78_000)
})
