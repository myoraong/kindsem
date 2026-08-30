import assert from "node:assert/strict"
import test from "node:test"
import { calculateDsr } from "./dsr.ts"
import { DSR_POLICY } from "./policy.generated.ts"

test("은행 DSR은 연소득 40%이고 스트레스 가산을 붙이지 않는다", () => {
  const result = calculateDsr({
    incomeWon: 50_000_000,
    mortgageMonthlyWon: 1_200_000,
    otherMonthlyWon: 300_000,
    bank: "bank",
  })
  assert.ok(result)
  assert.equal(result.limit, DSR_POLICY.bank)
  assert.equal(result.annual, 18_000_000)
  assert.equal(result.dsr, 18_000_000 / 50_000_000)
  assert.equal(result.cap, 20_000_000)
  assert.equal(result.allowed, true)
  assert.equal("add" in result, false)
})

test("비은행 DSR은 연소득 50%", () => {
  const result = calculateDsr({
    incomeWon: 50_000_000,
    mortgageMonthlyWon: 1_800_000,
    otherMonthlyWon: 300_000,
    bank: "nonbank",
  })
  assert.ok(result)
  assert.equal(result.limit, DSR_POLICY.nonbank)
  assert.equal(result.annual, 25_200_000)
  assert.equal(result.allowed, false)
})
