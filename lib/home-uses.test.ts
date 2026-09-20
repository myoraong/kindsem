import assert from "node:assert/strict"
import test from "node:test"
import { HOME_USES, HOME_USES_HEADING } from "./home-uses.ts"

test("홈 사용 장면은 고유하고 슬로건 말을 쓰지 않는다", () => {
  const forbidden = /친절한|웰컴|최고|차별화|lorem|ipsum|Welcome/i
  assert.equal(HOME_USES_HEADING.title, "이런 때 엽니다")
  assert.doesNotMatch(HOME_USES_HEADING.title, forbidden)
  assert.doesNotMatch(HOME_USES_HEADING.blurb, forbidden)
  assert.equal(HOME_USES.length, 4)
  const titles = new Set<string>()
  for (const item of HOME_USES) {
    assert.ok(item.title.length >= 8)
    assert.ok(item.body.length >= 40)
    assert.match(item.href, /^\/calc\//)
    assert.doesNotMatch(item.title, forbidden)
    assert.doesNotMatch(item.body, forbidden)
    assert.equal(titles.has(item.title), false, `제목 중복 ${item.title}`)
    titles.add(item.title)
  }
})
