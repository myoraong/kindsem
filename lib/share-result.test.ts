import assert from "node:assert/strict"
import test from "node:test"
import { shareWasCancelled } from "./share-result.ts"

test("공유 창을 닫으면 복사로 넘어가지 않는다", () => {
  assert.equal(shareWasCancelled({ name: "AbortError" }), true)
  assert.equal(shareWasCancelled({ name: "NotAllowedError" }), false)
  assert.equal(shareWasCancelled(null), false)
})
