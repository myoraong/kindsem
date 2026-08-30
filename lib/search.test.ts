import assert from "node:assert/strict"
import test from "node:test"
import { searchCalculators } from "./search.ts"

test("빈 검색은 결과를 내지 않는다", () => {
  assert.deepEqual(searchCalculators(""), [])
  assert.deepEqual(searchCalculators("   "), [])
})

test("제목으로 찾는다", () => {
  const rows = searchCalculators("주휴수당")
  assert.equal(rows.length, 1)
  assert.equal(rows[0]?.slug, "weekly-holiday")
})

test("별칭으로 복비·DSR을 찾는다", () => {
  assert.equal(searchCalculators("복비")[0]?.slug, "brokerage")
  assert.equal(searchCalculators("dsr")[0]?.slug, "dsr")
  assert.equal(searchCalculators("자동차")[0]?.slug, "vehicle-tax")
})

test("여러 단어는 모두 맞아야 한다", () => {
  const rows = searchCalculators("양도 법인")
  assert.equal(rows[0]?.slug, "corporate-gains")
})

test("생활 탭에서는 생활만 찾는다", () => {
  assert.equal(searchCalculators("자동차", "today")[0]?.slug, "vehicle-tax")
  assert.deepEqual(searchCalculators("주휴수당", "today"), [])
  assert.deepEqual(searchCalculators("복비", "today"), [])
})

test("급여 탭에서는 급여만 찾는다", () => {
  assert.equal(searchCalculators("주휴수당", "work")[0]?.slug, "weekly-holiday")
  assert.deepEqual(searchCalculators("복비", "work"), [])
})

test("부동산 탭에서는 부동산만 찾는다", () => {
  assert.equal(searchCalculators("복비", "realty")[0]?.slug, "brokerage")
  assert.deepEqual(searchCalculators("주휴수당", "realty"), [])
})

test("전체에서는 생활·급여·부동산을 모두 찾는다", () => {
  assert.equal(searchCalculators("자동차", "all")[0]?.slug, "vehicle-tax")
  assert.equal(searchCalculators("주휴수당", "all")[0]?.slug, "weekly-holiday")
  assert.equal(searchCalculators("복비", "all")[0]?.slug, "brokerage")
})
