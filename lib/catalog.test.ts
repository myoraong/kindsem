import assert from "node:assert/strict"
import test from "node:test"
import { CATALOG_HEADINGS, CALCULATORS, getCalculator } from "./catalog.ts"

test("홈 섹션 제목은 생활·급여·부동산이다", () => {
  assert.equal(CATALOG_HEADINGS.today.title, "생활")
  assert.equal(CATALOG_HEADINGS.work.title, "급여")
  assert.equal(CATALOG_HEADINGS.realty.title, "부동산")
})

test("홈 섹션 설명은 사실만 적고 슬로건 말을 쓰지 않는다", () => {
  const forbidden = /친절한|바로|한 장으로|웰컴/
  for (const section of Object.values(CATALOG_HEADINGS)) {
    assert.ok(section.blurb.length > 0)
    assert.doesNotMatch(section.blurb, forbidden)
  }
  assert.equal(CATALOG_HEADINGS.today.blurb, "더치페이, 사다리타기, 자동차 취득세.")
  assert.equal(CATALOG_HEADINGS.work.blurb, "실수령, 최저임금, 주휴·연차·퇴직금. 근로기준법·세법 기준.")
  assert.equal(CATALOG_HEADINGS.realty.blurb, "취득·보유·양도, 전월세, 대출 한도. 법령·고시.")
})

test("급여에서 연봉비교는 실수령 바로 다음이다", () => {
  const work = CALCULATORS.filter((item) => item.group === "work")
  const takeHome = work.findIndex((item) => item.slug === "take-home")
  assert.equal(work[0]?.slug, "take-home")
  assert.equal(work[takeHome + 1]?.slug, "offer-compare")
})

test("미리보기 계산기가 카탈로그에 있다", () => {
  assert.equal(getCalculator("overtime-pay")?.title, "연장·야간·휴일 수당")
  assert.equal(getCalculator("jeonse-vs-rent")?.title, "전세 vs 월세")
  assert.equal(getCalculator("import-duty")?.title, "해외직구 관세·부가세")
  assert.equal(getCalculator("parental-leave")?.title, "육아휴직 급여")
  assert.equal(getCalculator("min-wage")?.title, "최저임금")
  assert.equal(getCalculator("maternity-leave")?.title, "출산전후휴가 급여")
  assert.equal(getCalculator("loan-interest")?.title, "대출 이자")
  assert.equal(getCalculator("loan-interest")?.group, "loan")
  assert.equal(getCalculator("car-tax")?.title, "자동차세")
  assert.equal(getCalculator("part-time-month")?.title, "알바 월급")
  assert.equal(getCalculator("prorate-pay")?.title, "월급 일할")
  assert.equal(getCalculator("deposit")?.title, "예적금")
  assert.equal(getCalculator("rent-credit")?.title, "월세 세액공제")
  assert.equal(getCalculator("ladder")?.title, "사다리타기")
  assert.equal(getCalculator("ladder")?.group, "today")
})
