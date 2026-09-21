import assert from "node:assert/strict"
import test from "node:test"
import { fieldNeedsReveal } from "./field-reveal.ts"

test("가려진 입력칸만 화면 안으로 올립니다", () => {
  assert.equal(fieldNeedsReveal({ top: 200, bottom: 248 }, 800, 80, 96), false)
  assert.equal(fieldNeedsReveal({ top: 40, bottom: 88 }, 800, 80, 96), true)
  assert.equal(fieldNeedsReveal({ top: 700, bottom: 748 }, 800, 80, 96), true)
  assert.equal(fieldNeedsReveal({ top: 200, bottom: 248 }, 0, 80, 96), false)
})
