import assert from "node:assert/strict"
import test from "node:test"
import { applyMoneyNudge, moneyNudge } from "./money-nudge.ts"

test("만원 칸은 금액 크기에 맞춰 더하고 뺀다", () => {
  assert.deepEqual(moneyNudge("만원", 4000), { step: 100, label: "100만" })
  assert.deepEqual(moneyNudge("만원", 65000), { step: 1000, label: "1,000만" })
  assert.deepEqual(moneyNudge("만원", 300), { step: 10, label: "10만" })
  assert.deepEqual(moneyNudge("만원", 60), { step: 1, label: "1만" })
  assert.equal(moneyNudge("만원", 0), null)
  assert.equal(moneyNudge("명", 4), null)
})

test("원과 퍼센트도 한 칸씩 움직인다", () => {
  assert.deepEqual(moneyNudge("원", 10320), { step: 100, label: "100원" })
  assert.deepEqual(moneyNudge("%", 3.8), { step: 0.1, label: "0.1%" })
  assert.equal(applyMoneyNudge(4000, 100), "4100")
  assert.equal(applyMoneyNudge(3.8, 0.1), "3.9")
  assert.equal(applyMoneyNudge(0.1, -0.1), null)
})
