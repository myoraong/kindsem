import assert from "node:assert/strict"
import test from "node:test"
import { kakaoCopyLine } from "./format.ts"

test("카카오 한 줄은 라벨·금액·짧은 주를 붙인다", () => {
  assert.equal(kakaoCopyLine("실수령", "3,210,000원", "주휴 포함"), "실수령 3,210,000원 · 주휴 포함")
  assert.equal(kakaoCopyLine("주휴수당", "80,000원"), "주휴수당 80,000원")
})
