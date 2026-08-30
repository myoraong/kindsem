import assert from "node:assert/strict"
import test from "node:test"
import { calcParentalLeave, PARENTAL_FLOOR } from "./parental-leave.ts"

test("제95조 1~3개월은 100% 상한 250만, 4~6개월 200만, 7개월부터 80% 160만", () => {
  const high = calcParentalLeave({ monthlyOrdinary: 4_000_000, months: 12 })
  assert.ok(high)
  assert.equal(high.rows[0]?.pay, 2_500_000)
  assert.equal(high.rows[3]?.pay, 2_000_000)
  assert.equal(high.rows[6]?.pay, 1_600_000)
  assert.equal(high.total, 2_500_000 * 3 + 2_000_000 * 3 + 1_600_000 * 6)

  const mid = calcParentalLeave({ monthlyOrdinary: 2_200_000, months: 1 })
  assert.ok(mid)
  assert.equal(mid.firstMonth, 2_200_000)

  const low = calcParentalLeave({ monthlyOrdinary: 500_000, months: 1 })
  assert.ok(low)
  assert.equal(low.firstMonth, PARENTAL_FLOOR)
})

test("7개월째는 통상임금 80%에 상한 160만", () => {
  const result = calcParentalLeave({ monthlyOrdinary: 1_800_000, months: 7 })
  assert.ok(result)
  assert.equal(result.rows[6]?.rate, 0.8)
  assert.equal(result.rows[6]?.pay, 1_440_000)
})

test("한부모 특례 1~3개월 상한 300만", () => {
  const result = calcParentalLeave({ monthlyOrdinary: 4_000_000, months: 3, mode: "single" })
  assert.ok(result)
  assert.equal(result.rows[0]?.pay, 3_000_000)
})

test("맞돌봄 각각 6개월이면 1~6개월 상한표", () => {
  const result = calcParentalLeave({
    monthlyOrdinary: 5_000_000,
    months: 6,
    mode: "both",
    bothMonths: 6,
  })
  assert.ok(result)
  assert.deepEqual(
    result.rows.map((row) => row.pay),
    [2_500_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000, 4_500_000],
  )
})
