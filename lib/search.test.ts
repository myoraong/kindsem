import assert from "node:assert/strict"
import test from "node:test"
import { searchCalculators, searchCalculatorsVisible } from "./search.ts"

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
  assert.equal(searchCalculators("복비얼마")[0]?.slug, "brokerage")
  assert.equal(searchCalculators("dsr")[0]?.slug, "dsr")
  assert.equal(searchCalculators("자동차세")[0]?.slug, "car-tax")
  assert.equal(searchCalculators("자동차취득세")[0]?.slug, "vehicle-tax")
  assert.equal(searchCalculators("실수령액")[0]?.slug, "take-home")
  assert.equal(searchCalculators("넷페이")[0]?.slug, "take-home")
  assert.equal(searchCalculators("주휴일수당")[0]?.slug, "weekly-holiday")
  assert.equal(searchCalculators("연장수당")[0]?.slug, "overtime-pay")
  assert.equal(searchCalculators("야근수당")[0]?.slug, "overtime-pay")
  assert.equal(searchCalculators("잔업수당")[0]?.slug, "overtime-pay")
  assert.equal(searchCalculators("부가세포함")[0]?.slug, "sale-vat")
  assert.equal(searchCalculators("연차발생")[0]?.slug, "annual-leave")
  assert.equal(searchCalculators("주담대이자")[0]?.slug, "mortgage")
  assert.equal(searchCalculators("해외직구")[0]?.slug, "import-duty")
  assert.equal(searchCalculators("구직급여")[0]?.slug, "benefit-net")
  assert.equal(searchCalculators("최저임금")[0]?.slug, "min-wage")
  assert.equal(searchCalculators("출산전후휴가")[0]?.slug, "maternity-leave")
  assert.equal(searchCalculators("만기일시")[0]?.slug, "loan-interest")
  assert.equal(searchCalculators("전세vs월세")[0]?.slug, "jeonse-vs-rent")
  assert.equal(searchCalculators("사다리타기")[0]?.slug, "ladder")
  assert.equal(searchCalculators("제비뽑기")[0]?.slug, "ladder")
  assert.equal(searchCalculators("사다리게임")[0]?.slug, "ladder")
  assert.equal(searchCalculators("평수")[0]?.slug, "pyeong")
  assert.equal(searchCalculators("평당가")[0]?.slug, "pyeong")
  assert.equal(searchCalculators("제곱미터")[0]?.slug, "pyeong")
})

test("계산기 검색어로도 찾는다", () => {
  assert.equal(searchCalculators("실수령액 계산기")[0]?.slug, "take-home")
  assert.equal(searchCalculators("퇴직금 계산기")[0]?.slug, "severance")
  assert.equal(searchCalculators("퇴직소득세")[0]?.slug, "retirement-tax")
  assert.equal(searchCalculators("상속세")[0]?.slug, "inheritance")
  assert.equal(searchCalculators("주휴수당 계산기")[0]?.slug, "weekly-holiday")
  assert.equal(searchCalculators("중개수수료 계산기")[0]?.slug, "brokerage")
  assert.equal(searchCalculators("취득세 계산기").some((row) => row.slug === "acquisition"), true)
  assert.equal(searchCalculators("자동차세 계산기")[0]?.slug, "car-tax")
})

test("여러 단어는 모두 맞아야 한다", () => {
  const rows = searchCalculators("양도 법인")
  assert.equal(rows[0]?.slug, "corporate-gains")
})

test("생활 탭에서는 생활만 찾는다", () => {
  assert.equal(searchCalculators("자동차세", "today")[0]?.slug, "car-tax")
  assert.equal(searchCalculators("자동차취득세", "today")[0]?.slug, "vehicle-tax")
  assert.equal(searchCalculators("사다리타기", "today")[0]?.slug, "ladder")
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
  assert.equal(searchCalculators("자동차세", "all")[0]?.slug, "car-tax")
  assert.equal(searchCalculators("주휴수당", "all")[0]?.slug, "weekly-holiday")
  assert.equal(searchCalculators("복비", "all")[0]?.slug, "brokerage")
})

test("실수령만 넣어도 실수령액 계산기가 나온다", () => {
  assert.equal(searchCalculators("실수령")[0]?.slug, "take-home")
})

test("고른 분류에 없으면 전체에서 찾는다", () => {
  assert.deepEqual(searchCalculators("실수령", "today"), [])
  assert.equal(searchCalculatorsVisible("실수령", "today")[0]?.slug, "take-home")
  assert.equal(searchCalculatorsVisible("주휴수당", "today")[0]?.slug, "weekly-holiday")
  assert.equal(searchCalculatorsVisible("복비", "work")[0]?.slug, "brokerage")
})
