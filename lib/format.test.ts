import assert from "node:assert/strict"
import test from "node:test"
import { formatKoreanUnit, formatWon, manwonToWon } from "./format.ts"

test("원 금액은 천 단위 구분 기호를 붙인다", () => {
  assert.equal(formatWon(0), "0원")
  assert.equal(formatWon(10_000), "10,000원")
  assert.equal(formatWon(1_234_567), "1,234,567원")
})

test("만 단위 10,000은 억으로 올린다", () => {
  assert.equal(formatKoreanUnit(10_000 * 10_000), "1억원")
  assert.equal(formatKoreanUnit(manwonToWon(10_000)), "1억원")
})

test("억 단위 10,000은 조로 올리고 10000억을 쓰지 않는다", () => {
  assert.equal(formatKoreanUnit(10_000 * 100_000_000), "1조원")
  assert.equal(formatKoreanUnit(manwonToWon(100_000_000)), "1조원")
  assert.equal(formatKoreanUnit(1_000_000_000_000).includes("10000"), false)
})

test("조 단위 10,000은 경으로 올린다", () => {
  assert.equal(formatKoreanUnit(10_000 * 1_000_000_000_000), "1경원")
})

test("억·만 나머지는 읽기 쉽게 쉼표를 붙인다", () => {
  assert.equal(formatKoreanUnit(1_234_567_890), "12억 3,456만원")
  assert.equal(formatKoreanUnit(1_234_500_000_000), "1조 2,345억원")
  assert.equal(formatKoreanUnit(1_234_567_890_000), "1조 2,345억 6,789만원")
})

test("만 이하와 부호·0도 기존 스타일을 지킨다", () => {
  assert.equal(formatKoreanUnit(0), "0원")
  assert.equal(formatKoreanUnit(5_000), "5,000원")
  assert.equal(formatKoreanUnit(12_345), "1만 2,345원")
  assert.equal(formatKoreanUnit(-100_000_000), "-1억원")
})
