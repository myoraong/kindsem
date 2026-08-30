import assert from "node:assert/strict"
import test from "node:test"
import { readRecentCalcs, rememberRecentCalc, RECENT_CALCS_MAX } from "./recent-calcs.ts"

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
