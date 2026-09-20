import assert from "node:assert/strict"
import test from "node:test"
import { SITE_NAME, SITE_SEARCH_NAME } from "./site.ts"

test("검색용 사이트 이름은 도메인이 아니라 계산기라고 적는다", () => {
  assert.equal(SITE_SEARCH_NAME, "카인드셈 종합계산기")
  assert.ok(SITE_SEARCH_NAME.length <= 16)
  assert.match(SITE_SEARCH_NAME, /계산기/)
  assert.doesNotMatch(SITE_SEARCH_NAME, /kindsem\.com/i)
  assert.doesNotMatch(SITE_SEARCH_NAME, /편리한|친절한|최고|웰컴/)
  assert.equal(SITE_NAME, "Kindsem 카인드셈")
})
