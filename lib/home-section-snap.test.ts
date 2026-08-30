import assert from "node:assert/strict"
import test from "node:test"
import {
  HOME_SECTION_SNAP_GAP_PX,
  homeSectionFromHref,
  homeSectionSnapScrollY,
  homeSectionSnapTargetId,
  homeSectionStickyOffset,
  homeSectionToSnap,
  isExplicitHomeSectionHash,
} from "./home-section-snap.ts"

test("전체는 첫 제목(생활)에 맞추고 나머지는 자기 섹션이다", () => {
  assert.equal(homeSectionSnapTargetId("all"), "today")
  assert.equal(homeSectionSnapTargetId("today"), "today")
  assert.equal(homeSectionSnapTargetId("work"), "work")
  assert.equal(homeSectionSnapTargetId("realty"), "realty")
})

test("칩·헤더 링크에서 홈 섹션 해시를 읽는다", () => {
  assert.equal(homeSectionFromHref("#realty"), "realty")
  assert.equal(homeSectionFromHref("/#realty"), "realty")
  assert.equal(homeSectionFromHref("/#today"), "today")
  assert.equal(homeSectionFromHref("/#work"), "work")
  assert.equal(homeSectionFromHref("/#all"), "all")
  assert.equal(homeSectionFromHref("/calc/brokerage"), null)
  assert.equal(homeSectionFromHref("/"), null)
})

test("랜딩(/) 빈 해시는 스냅하지 않고 칩 해시만 스냅한다", () => {
  assert.equal(isExplicitHomeSectionHash(""), false)
  assert.equal(isExplicitHomeSectionHash("#"), false)
  assert.equal(homeSectionToSnap(""), null)
  assert.equal(homeSectionToSnap("#realty"), "realty")
  assert.equal(homeSectionToSnap("#all"), "all")
  assert.equal(homeSectionToSnap("#nope"), null)
})

test("제목은 헤더+칩 아래 12px에 붙는다", () => {
  const header = 68
  const chips = 60
  const offset = homeSectionStickyOffset(header, chips)
  assert.equal(offset, header + chips + HOME_SECTION_SNAP_GAP_PX)
  assert.equal(HOME_SECTION_SNAP_GAP_PX, 12)

  assert.equal(homeSectionSnapScrollY(offset, 0, offset), 0)
  assert.equal(homeSectionSnapScrollY(400, 200, offset), 200 + 400 - offset)
  assert.equal(homeSectionSnapScrollY(10, 0, offset), 0)
})
