import assert from "node:assert/strict"
import test from "node:test"
import {
  readRecentCalcs,
  readRecentResults,
  rememberRecentCalc,
  rememberRecentResult,
  forgetRecentCalc,
  RECENT_CALCS_MAX,
} from "./recent-calcs.ts"

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

test("최근 본 계산기는 앞에 쌓이고 다섯 개를 넘기지 않는다", () => {
  const storage = memoryStorage()
  rememberRecentCalc("take-home", storage)
  rememberRecentCalc("weekly-holiday", storage)
  rememberRecentCalc("take-home", storage)
  assert.deepEqual(readRecentCalcs(storage).slice(0, 2), ["take-home", "weekly-holiday"])
  for (let i = 0; i < 8; i += 1) rememberRecentCalc(`s${i}`, storage)
  assert.equal(readRecentCalcs(storage).length, RECENT_CALCS_MAX)
  assert.equal(readRecentCalcs(storage)[0], "s7")
})

test("최근 결과는 계산기마다 남고, 목록에서 빠지면 같이 지운다", () => {
  const storage = memoryStorage()
  rememberRecentCalc("take-home", storage)
  rememberRecentResult("take-home", "2,812,935원", storage)
  rememberRecentResult("car-tax", "  280,000원  ", storage)
  assert.equal(readRecentResults(storage)["take-home"], "2,812,935원")
  assert.equal(readRecentResults(storage)["car-tax"], "280,000원")

  forgetRecentCalc("take-home", storage)
  assert.equal(readRecentResults(storage)["take-home"], undefined)
  assert.deepEqual(readRecentCalcs(storage), [])

  rememberRecentResult("take-home", "", storage)
  assert.equal(readRecentResults(storage)["take-home"], undefined)
})

test("다섯 개를 넘긴 계산기의 결과는 같이 지운다", () => {
  const storage = memoryStorage()
  for (let i = 0; i < 8; i += 1) {
    rememberRecentResult(`s${i}`, `${i}원`, storage)
    rememberRecentCalc(`s${i}`, storage)
  }
  const slugs = readRecentCalcs(storage)
  const results = readRecentResults(storage)
  assert.deepEqual(Object.keys(results).sort(), [...slugs].sort())
  assert.equal(results.s0, undefined)
  assert.equal(results.s7, "7원")
})

test("최근 결과 저장이 깨져 있으면 빈 목록으로 본다", () => {
  const storage = memoryStorage({ "kindsem-recent-results": "{not-json" })
  assert.deepEqual(readRecentResults(storage), {})
})

test("최근 본 계산기는 하나씩 지울 수 있다", () => {
  const storage = memoryStorage()
  rememberRecentCalc("dutch", storage)
  rememberRecentCalc("dsr", storage)
  forgetRecentCalc("dutch", storage)
  assert.deepEqual(readRecentCalcs(storage), ["dsr"])
  forgetRecentCalc("dsr", storage)
  assert.deepEqual(readRecentCalcs(storage), [])
})
