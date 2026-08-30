import assert from "node:assert/strict"
import test from "node:test"
import {
  HOME_BACK,
  homeSectionForGroup,
  parseBackSection,
  readBackSection,
  rememberBackSection,
} from "./home-back.ts"

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem(key: string) {
      return data[key] ?? null
    },
    setItem(key: string, value: string) {
      data[key] = value
    },
  }
}

test("계산기 분류는 생활·급여·부동산 홈으로 돌아간다", () => {
  assert.equal(homeSectionForGroup("today"), "today")
  assert.equal(homeSectionForGroup("work"), "work")
  assert.equal(homeSectionForGroup("rent"), "realty")
  assert.equal(homeSectionForGroup("buy"), "realty")
  assert.equal(homeSectionForGroup("loan"), "realty")
  assert.equal(HOME_BACK.work.label, "급여")
  assert.equal(HOME_BACK.all.href, "/#all")
})

test("기억한 홈 분류를 읽고 이상한 값은 버린다", () => {
  assert.equal(parseBackSection("work"), "work")
  assert.equal(parseBackSection("nope"), null)
  const storage = memoryStorage()
  rememberBackSection("realty", storage)
  assert.equal(readBackSection("all", storage), "realty")
  assert.equal(readBackSection("today", memoryStorage()), "today")
})
