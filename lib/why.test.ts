import assert from "node:assert/strict"
import test from "node:test"
import { HOME_WHY, HOME_WHY_HEADING } from "./why.ts"

test("홈 다른 점 제목은 짧고 슬로건 말을 쓰지 않는다", () => {
  const forbidden = /친절한|바로|한 장으로|웰컴|최고|차별화|여기가/
  assert.equal(HOME_WHY_HEADING.title, "다른 점")
  assert.doesNotMatch(HOME_WHY_HEADING.title, forbidden)
  assert.doesNotMatch(HOME_WHY_HEADING.blurb, forbidden)
  assert.match(HOME_WHY_HEADING.blurb, /빼 둡니다/)
})

test("홈 다른 점은 세 줄이고 슬로건 말을 쓰지 않는다", () => {
  assert.equal(HOME_WHY.length, 3)
  const forbidden = /친절한|바로|한 장으로|웰컴|최고|차별화/
  for (const item of HOME_WHY) {
    assert.ok(item.title.length > 0)
    assert.ok(item.body.length > 0)
    assert.doesNotMatch(item.title, forbidden)
    assert.doesNotMatch(item.body, forbidden)
  }
  assert.equal(HOME_WHY[0].title, "한곳에서")
  assert.equal(HOME_WHY[1].title, "하루에 두 번")
  assert.equal(HOME_WHY[2].title, "빼 둠")
  assert.match(HOME_WHY[1].body, /법제처/)
  assert.match(HOME_WHY[2].body, /공제/)
  assert.match(HOME_WHY[2].body, /스트레스 DSR/)
})
