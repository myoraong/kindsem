import assert from "node:assert/strict"
import test from "node:test"
import { resultTabTitle } from "./result-title.ts"

test("탭 제목은 금액과 계산 이름을 붙인다", () => {
  assert.equal(resultTabTitle("2,812,935원", "월 실수령"), "2,812,935원 · 월 실수령")
  assert.equal(resultTabTitle("", "월 실수령"), "월 실수령")
  assert.equal(resultTabTitle("2,812,935원", ""), "2,812,935원")
})
