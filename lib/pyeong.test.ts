import assert from "node:assert/strict"
import test from "node:test"
import {
  M2_PER_PYEONG,
  calcPyeongPrice,
  formatM2,
  formatPyeong,
  m2ToPyeong,
  pyeongToM2,
} from "./pyeong.ts"

test("1평은 400/121㎡이고 1㎡는 0.3025평이다", () => {
  assert.equal(M2_PER_PYEONG, 400 / 121)
  assert.equal(pyeongToM2(1), 400 / 121)
  assert.equal(m2ToPyeong(1), 0.3025)
  assert.equal(m2ToPyeong(pyeongToM2(24)!), 24)
})

test("0 이하는 넓이를 내지 않는다", () => {
  assert.equal(pyeongToM2(0), null)
  assert.equal(m2ToPyeong(-1), null)
})

test("평당가는 원 미만을 버린다", () => {
  const row = calcPyeongPrice({ priceWon: 1_000_000_000, area: 34, unit: "pyeong" })
  assert.ok(row)
  assert.equal(row.perPyeong, Math.floor(1_000_000_000 / 34))
  assert.equal(row.perM2, Math.floor(1_000_000_000 / (34 * (400 / 121))))
})

test("㎡로 넣어도 평당가가 같다", () => {
  const m2 = pyeongToM2(25)!
  const fromPyeong = calcPyeongPrice({ priceWon: 800_000_000, area: 25, unit: "pyeong" })
  const fromM2 = calcPyeongPrice({ priceWon: 800_000_000, area: m2, unit: "m2" })
  assert.ok(fromPyeong)
  assert.ok(fromM2)
  assert.equal(fromPyeong.perPyeong, fromM2.perPyeong)
})

test("넓이 표시에 단위가 붙는다", () => {
  assert.match(formatM2(400 / 121), /㎡$/)
  assert.match(formatPyeong(1), /1평/)
})
