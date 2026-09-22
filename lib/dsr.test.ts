import assert from "node:assert/strict"
import test from "node:test"
import { calculateDsr, dsrMonthlyQuery } from "./dsr.ts"
import { manwonToWon } from "./format.ts"
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

test("월 납입 원을 DSR 만원 칸으로 넘기면 같은 원으로 돌아온다", () => {
  const mortgage = dsrMonthlyQuery("mortgage", 1_402_345.6)
  const params = new URLSearchParams(mortgage.slice(1))
  assert.equal(params.get("mortgage"), "140.2346")
  assert.equal(params.get("other"), null)
  assert.equal(manwonToWon(Number(params.get("mortgage"))), 1_402_346)

  const other = dsrMonthlyQuery("other", 437_500)
  const otherParams = new URLSearchParams(other.slice(1))
  assert.equal(otherParams.get("other"), "43.75")
  assert.equal(otherParams.get("mortgage"), null)
  assert.equal(dsrMonthlyQuery("mortgage", 0), "")
  assert.equal(dsrMonthlyQuery("other", Number.NaN), "")
})
