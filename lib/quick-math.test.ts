import assert from "node:assert/strict"
import test from "node:test"
import { computeQuick, formatQuickInput, formatQuickResult } from "./quick-math.ts"

test("바로 계산은 사칙과 0으로 나누기를 처리한다", () => {
  assert.equal(computeQuick(7, "+", 8), 15)
  assert.equal(computeQuick(12, "/", 4), 3)
  assert.equal(computeQuick(9, "/", 0), null)
  assert.equal(formatQuickResult(1234), "1,234")
  assert.equal(formatQuickInput("1234"), "1,234")
  assert.equal(formatQuickInput("1234.5"), "1,234.5")
})
