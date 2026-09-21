import assert from "node:assert/strict"
import test from "node:test"
import { chipMatches } from "./amount-chip.ts"

test("금액 단추는 지금 칸의 숫자와 같으면 고른 상태다", () => {
  assert.equal(chipMatches("4000", "4000"), true)
  assert.equal(chipMatches("4,000", "4000"), true)
  assert.equal(chipMatches("150000", "4000"), false)
  assert.equal(chipMatches("", "4000"), false)
  assert.equal(chipMatches(undefined, "4000"), false)
})
