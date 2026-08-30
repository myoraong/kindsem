import assert from "node:assert/strict"
import test from "node:test"
import { calculateLtv } from "./ltv.ts"
import { LTV_POLICY } from "./policy.generated.ts"

test("비규제 일반은 별표 6 비율만 적용하고 수도권 절대한도는 쓰지 않는다", () => {
  const tenEok = calculateLtv({
    collateralWon: 1_000_000_000,
    desiredWon: 700_000_000,
    zone: "unregulated",
    borrower: "general",
  })
  assert.ok(tenEok)
  assert.equal(tenEok.rate, LTV_POLICY.unregulated)
  assert.equal(tenEok.maxByRate, 700_000_000)
  assert.equal(tenEok.maxLoan, 700_000_000)
  assert.equal(tenEok.firstTimeCap, null)
  assert.equal(tenEok.allowed, true)

  const twentyEok = calculateLtv({
    collateralWon: 2_000_000_000,
    desiredWon: 0,
    zone: "unregulated",
    borrower: "general",
  })
  assert.ok(twentyEok)
  assert.equal(twentyEok.maxLoan, 1_400_000_000)
})

test("규제지역 일반은 별표 6 50%", () => {
  const result = calculateLtv({
    collateralWon: 1_000_000_000,
    desiredWon: 400_000_000,
    zone: "adjusted",
    borrower: "general",
  })
  assert.ok(result)
  assert.equal(result.rate, LTV_POLICY.regulated)
  assert.equal(result.maxLoan, 500_000_000)
  assert.equal(result.allowed, true)
})

test("생애최초는 비율과 별표 6 대출 한도만 겹친다", () => {
  const result = calculateLtv({
    collateralWon: 1_000_000_000,
    desiredWon: 700_000_000,
    zone: "unregulated",
    borrower: "first",
  })
  assert.ok(result)
  assert.equal(result.rate, LTV_POLICY.firstTime)
  assert.equal(result.maxByRate, 800_000_000)
  assert.equal(result.firstTimeCap, LTV_POLICY.firstTimeCap)
  assert.equal(result.maxLoan, LTV_POLICY.firstTimeCap)
  assert.equal(result.allowed, false)
})
