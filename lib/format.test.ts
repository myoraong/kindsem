import assert from "node:assert/strict"
import test from "node:test"
import { kakaoCopyLine, formatGroupedInput, caretIndexAfterGroup } from "./format.ts"

test("카카오 한 줄은 라벨·금액·짧은 주를 붙인다", () => {
  assert.equal(kakaoCopyLine("실수령", "3,210,000원", "주휴 포함"), "실수령 3,210,000원 · 주휴 포함")
  assert.equal(kakaoCopyLine("주휴수당", "80,000원"), "주휴수당 80,000원")
})

test("입력칸 숫자는 천 단위로 띄운다", () => {
  assert.equal(formatGroupedInput("6500"), "6,500")
  assert.equal(formatGroupedInput("1234567"), "1,234,567")
  assert.equal(formatGroupedInput("3.3"), "3.3")
  assert.equal(formatGroupedInput("123."), "123.")
  assert.equal(formatGroupedInput(""), "")
})

test("천 단위 쉼표 뒤에도 커서는 친 숫자 뒤에 남는다", () => {
  assert.equal(caretIndexAfterGroup("6500", 1), 1)
  assert.equal(caretIndexAfterGroup("6500", 4), 5)
  assert.equal(caretIndexAfterGroup("1234567", 1), 1)
  assert.equal(caretIndexAfterGroup("1234567", 4), 5)
  assert.equal(caretIndexAfterGroup("103205", 6), 7)
  assert.equal(caretIndexAfterGroup("123.", 4), 4)
})
