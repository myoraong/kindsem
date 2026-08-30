import assert from "node:assert/strict"
import test from "node:test"
import {
  HOME_CHIP_ACTIVE,
  HOME_CHIP_INACTIVE,
  HOME_SECTIONS,
  homeChipClass,
  isHomePath,
  parseHomeSection,
} from "./home-section.ts"

test("빈 해시와 전체 해시는 전체 섹션이다", () => {
  assert.equal(parseHomeSection(""), "all")
  assert.equal(parseHomeSection("#"), "all")
  assert.equal(parseHomeSection("#all"), "all")
  assert.equal(parseHomeSection("all"), "all")
})

test("생활·급여·부동산 해시를 읽는다", () => {
  assert.equal(parseHomeSection("#today"), "today")
  assert.equal(parseHomeSection("#work"), "work")
  assert.equal(parseHomeSection("#realty"), "realty")
})

test("모르는 해시는 전체로 둔다", () => {
  assert.equal(parseHomeSection("#nope"), "all")
  assert.equal(parseHomeSection("work"), "work")
})

test("홈 경로만 섹션 탭으로 본다", () => {
  assert.equal(isHomePath("/"), true)
  assert.equal(isHomePath(""), true)
  assert.equal(isHomePath("/calc/take-home"), false)
  assert.equal(isHomePath("/realty"), false)
})

test("현재 보고 있는 분류 칩만 민트 배경이다", () => {
  assert.match(HOME_CHIP_ACTIVE, /\bbg-accent\b/)
  assert.doesNotMatch(HOME_CHIP_ACTIVE, /\bbg-card\b/)
  assert.match(HOME_CHIP_INACTIVE, /\bbg-card\b/)
  assert.doesNotMatch(HOME_CHIP_INACTIVE, /\bbg-accent\b/)

  for (const section of HOME_SECTIONS) {
    const tones = HOME_SECTIONS.map((id) => homeChipClass(id, section))
    assert.equal(tones.filter((tone) => tone === HOME_CHIP_ACTIVE).length, 1)
    assert.equal(tones.filter((tone) => tone === HOME_CHIP_INACTIVE).length, 3)
    assert.equal(homeChipClass(section, section), HOME_CHIP_ACTIVE)
  }
})
