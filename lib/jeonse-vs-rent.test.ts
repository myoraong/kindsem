import assert from "node:assert/strict"
import test from "node:test"
import { calcJeonseVsRent } from "./jeonse-vs-rent.ts"

test("전세 2억·월세 보증금 5천이면 상한 월세와 실제 월세를 비교한다", () => {
  const result = calcJeonseVsRent({
    jeonse: 200_000_000,
    monthlyDeposit: 50_000_000,
    monthlyRent: 700_000,
    baseRate: 0.0275,
    jeonseInterestMonthly: 400_000,
  })
  assert.ok(result)
  assert.equal(result.cap, 0.0475)
  assert.equal(result.converted, 150_000_000)
  assert.equal(result.monthlyCap, 593_750)
  assert.equal(result.overCap, true)
  assert.equal(result.jeonseBurden, 400_000)
  assert.equal(result.rentBurden, 700_000)
})

test("약정 월세가 상한 이하면 overCap이 아니다", () => {
  const result = calcJeonseVsRent({
    jeonse: 200_000_000,
    monthlyDeposit: 50_000_000,
    monthlyRent: 500_000,
    baseRate: 0.0275,
  })
  assert.ok(result)
  assert.equal(result.overCap, false)
  assert.equal(result.jeonseBurden, 0)
})
