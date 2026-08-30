import assert from "node:assert/strict"
import test from "node:test"
import { CATALOG_HEADINGS, getCalculator } from "./catalog.ts"

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
})

test("미리보기 계산기가 카탈로그에 있다", () => {
  assert.equal(getCalculator("overtime-pay")?.title, "연장·야간·휴일 수당")
  assert.equal(getCalculator("jeonse-vs-rent")?.title, "전세 vs 월세")
  assert.equal(getCalculator("import-duty")?.title, "해외직구 관세·부가세")
  assert.equal(getCalculator("parental-leave")?.title, "육아휴직 급여")
})
