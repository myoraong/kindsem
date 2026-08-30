import assert from "node:assert/strict"
import test from "node:test"
import {
  computeQuick,
  formatQuickInput,
  formatQuickResult,
  previewQuickResult,
  shownCopyText,
} from "./quick-math.ts"

test("바로 계산은 사칙과 0으로 나누기를 처리한다", () => {
  assert.equal(computeQuick(7, "+", 8), 15)
  assert.equal(computeQuick(12, "/", 4), 3)
  assert.equal(computeQuick(9, "/", 0), null)
  assert.equal(formatQuickResult(1234), "1,234")
  assert.equal(formatQuickInput("1234"), "1,234")
  assert.equal(formatQuickInput("1234.5"), "1,234.5")
})

test("두 번째 항을 치는 동안 아래는 잠정 결과다", () => {
  const live = previewQuickResult({
    display: "698",
    stored: 985,
    op: "+",
    waiting: false,
    error: false,
  })
  assert.equal(live.text, "1,683")
  assert.equal(live.value, 1683)

  const afterOp = previewQuickResult({
    display: "985",
    stored: 985,
    op: "+",
    waiting: true,
    error: false,
  })
  assert.equal(afterOp.text, "985")
  assert.equal(afterOp.value, 985)

  const divideZero = previewQuickResult({
    display: "0",
    stored: 9,
    op: "/",
    waiting: false,
    error: false,
  })
  assert.equal(divideZero.text, "오류")
  assert.equal(divideZero.value, null)
})

test("복사는 식 아래 큰 숫자다", () => {
  const live = previewQuickResult({
    display: "5",
    stored: 985,
    op: "+",
    waiting: false,
    error: false,
  })
  assert.equal(live.text, "990")
  assert.equal(shownCopyText(live.text), "990")
  assert.equal(shownCopyText("1,683"), "1683")
  assert.equal(shownCopyText("오류"), null)
})
