import assert from "node:assert/strict"
import test from "node:test"
import { isHomePath, parseHomeSection } from "./home-section.ts"

test("빈 해시는 생활 섹션이다", () => {
  assert.equal(parseHomeSection(""), "today")
  assert.equal(parseHomeSection("#"), "today")
})

test("생활·급여·부동산 해시를 읽는다", () => {
  assert.equal(parseHomeSection("#today"), "today")
  assert.equal(parseHomeSection("#work"), "work")
  assert.equal(parseHomeSection("#realty"), "realty")
})

test("모르는 해시는 생활로 둔다", () => {
  assert.equal(parseHomeSection("#nope"), "today")
  assert.equal(parseHomeSection("work"), "work")
})

test("홈 경로만 섹션 탭으로 본다", () => {
  assert.equal(isHomePath("/"), true)
  assert.equal(isHomePath(""), true)
  assert.equal(isHomePath("/calc/take-home"), false)
  assert.equal(isHomePath("/realty"), false)
})
