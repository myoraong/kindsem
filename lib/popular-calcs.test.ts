import assert from "node:assert/strict"
import test from "node:test"
import { POPULAR_SLUGS, popularCalculators } from "./popular-calcs.ts"

test("자주 찾는 계산기는 카탈로그에 있다", () => {
  const items = popularCalculators()
  assert.equal(items.length, POPULAR_SLUGS.length)
  assert.deepEqual(
    items.map((item) => item.slug),
    [...POPULAR_SLUGS],
  )
  assert.deepEqual(
    items.map((item) => item.title),
    ["실수령", "주휴수당", "퇴직금", "취득세", "중개수수료", "더치페이", "DSR", "증여세"],
  )
})
