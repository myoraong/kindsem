import assert from "node:assert/strict"
import test from "node:test"
import { calcLoanInterest, equalPayment, equalPrincipal, interestOnly } from "./loan.ts"

test("원리금균등 월 납입은 공식과 같다", () => {
  const result = calcLoanInterest({
    principal: 10_000_000,
    annualPercent: 12,
    months: 12,
    method: "equal-payment",
  })
  assert.ok(result)
  const expected = equalPayment(10_000_000, 12, 12)
  assert.equal(result.monthly, expected.monthly)
  assert.equal(result.totalInterest, expected.totalInterest)
})

test("원금균등은 첫 달이 마지막보다 크다", () => {
  const result = calcLoanInterest({
    principal: 12_000_000,
    annualPercent: 6,
    months: 12,
    method: "equal-principal",
  })
  assert.ok(result)
  const expected = equalPrincipal(12_000_000, 6, 12)
  assert.equal(result.first, expected.first)
  assert.ok(result.first > result.last)
})

test("만기일시는 이자만 내고 만기에 원금을 더한다", () => {
  const result = calcLoanInterest({
    principal: 10_000_000,
    annualPercent: 12,
    months: 12,
    method: "interest-only",
  })
  assert.ok(result)
  const expected = interestOnly(10_000_000, 12, 12)
  assert.equal(result.monthly, expected.monthly)
  assert.equal(result.totalPay, 10_000_000 + expected.totalInterest)
})

test("원금 0이면 계산하지 않는다", () => {
  assert.equal(
    calcLoanInterest({ principal: 0, annualPercent: 5, months: 12, method: "equal-payment" }),
    null,
  )
})
