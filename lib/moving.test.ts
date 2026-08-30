import assert from "node:assert/strict"
import test from "node:test"
import { calcBrokerage } from "./brokerage.ts"
import { equalPayment, interestOnly } from "./loan.ts"
import { calcMovingTotal } from "./moving.ts"

test("입력이 모두 0이면 결과를 내지 않는다", () => {
  assert.equal(
    calcMovingTotal({
      deal: "jeonse",
      depositWon: 0,
      monthlyRentWon: 0,
      moveWon: 0,
      stuffWon: 0,
      insuranceWon: 0,
      loanWon: 0,
      annualRatePercent: 3.5,
      years: 2,
      loanMethod: "interest-only",
    }),
    null,
  )
})

test("전세는 월세를 넣지 않고, 대출 없으면 당일 현금은 보증금+복비+이사비용", () => {
  const result = calcMovingTotal({
    deal: "jeonse",
    depositWon: 100_000_000,
    monthlyRentWon: 500_000,
    moveWon: 500_000,
    stuffWon: 300_000,
    insuranceWon: 80_000,
    loanWon: 0,
    annualRatePercent: 3.5,
    years: 2,
    loanMethod: "interest-only",
  })
  assert.ok(result)
  assert.equal(result.monthlyRent, 0)
  assert.equal(result.hasLoan, false)
  assert.equal(result.loanReady, false)
  const fee = calcBrokerage({
    deal: "jeonse",
    property: "house",
    price: 100_000_000,
    includeVat: true,
  })
  assert.equal(result.brokerage.total, fee.total)
  assert.equal(
    result.cashOnDay,
    100_000_000 + fee.total + 500_000 + 300_000 + 80_000,
  )
})

test("월세는 첫 달 월세를 넣고 대출금을 뺀다", () => {
  const deposit = 50_000_000
  const monthly = 500_000
  const move = 250_000
  const stuff = 300_000
  const insurance = 80_000
  const loan = 30_000_000
  const result = calcMovingTotal({
    deal: "wolse",
    depositWon: deposit,
    monthlyRentWon: monthly,
    moveWon: move,
    stuffWon: stuff,
    insuranceWon: insurance,
    loanWon: loan,
    annualRatePercent: 4.2,
    years: 2,
    loanMethod: "equal-payment",
  })
  assert.ok(result)
  assert.equal(result.monthlyRent, monthly)
  assert.equal(result.hasLoan, true)
  const fee = calcBrokerage({
    deal: "wolse",
    property: "house",
    price: deposit,
    monthlyRent: monthly,
    includeVat: true,
  })
  const gross = deposit + monthly + fee.total + move + stuff + insurance
  assert.equal(result.grossCash, gross)
  assert.equal(result.cashOnDay, gross - loan)
  const pay = equalPayment(loan, 4.2, 24)
  assert.equal(result.monthlyLabel, "월 원리금")
  assert.equal(result.monthlyPay, pay.monthly)
})

test("대출이 당일 비용보다 크면 현금은 0원", () => {
  const result = calcMovingTotal({
    deal: "jeonse",
    depositWon: 10_000_000,
    monthlyRentWon: 0,
    moveWon: 200_000,
    stuffWon: 0,
    insuranceWon: 0,
    loanWon: 50_000_000,
    annualRatePercent: 3.5,
    years: 2,
    loanMethod: "interest-only",
  })
  assert.ok(result)
  assert.equal(result.cashOnDay, 0)
  assert.ok(result.loanSurplus > 0)
  const interest = interestOnly(50_000_000, 3.5, 24)
  assert.equal(result.monthlyLabel, "월 이자")
  assert.equal(result.monthlyPay, interest.monthly)
  assert.equal(result.annualInterest, interestOnly(50_000_000, 3.5, 12).totalInterest)
})

test("대출 기간이 없으면 이자는 건너뛴다", () => {
  const result = calcMovingTotal({
    deal: "jeonse",
    depositWon: 20_000_000,
    monthlyRentWon: 0,
    moveWon: 0,
    stuffWon: 0,
    insuranceWon: 0,
    loanWon: 10_000_000,
    annualRatePercent: 3.5,
    years: 0,
    loanMethod: "interest-only",
  })
  assert.ok(result)
  assert.equal(result.hasLoan, true)
  assert.equal(result.loanReady, false)
  assert.equal(result.monthlyPay, 0)
  assert.equal(result.cashOnDay, 20_000_000 + result.brokerage.total - 10_000_000)
})
