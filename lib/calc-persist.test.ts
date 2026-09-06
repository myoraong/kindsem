import assert from "node:assert/strict"
import test from "node:test"
import {
  calcStateEquals,
  decodeCalcQuery,
  encodeCalcQuery,
  mergeCalcState,
  readCalcStorage,
  storageKeyForCalc,
  writeCalcStorage,
} from "./calc-persist.ts"

test("계산기 입력을 쿼리 문자열로 넣었다 다시 읽는다", () => {
  const defaults = { pay: "4000", meal: true, dep: "0" }
  const encoded = encodeCalcQuery({ pay: "5000", meal: false, dep: "2" })
  assert.equal(encoded, "?pay=5000&meal=0&dep=2")
  assert.deepEqual(decodeCalcQuery(encoded, defaults), {
    pay: "5000",
    meal: false,
    dep: "2",
  })
})

test("주소 값이 저장된 값보다 우선한다", () => {
  const merged = mergeCalcState(
    { pay: "4000", meal: true as boolean },
    { pay: "4500", meal: false },
    { pay: "6000" },
  )
  assert.deepEqual(merged, { pay: "6000", meal: false })
})

test("주소가 비면 저장된 입력을 쓴다", () => {
  const merged = mergeCalcState({ pay: "4000" }, { pay: "4800" }, {})
  assert.equal(merged.pay, "4800")
})

test("계산기 입력은 슬로그별로 기기에 남긴다", () => {
  const memory = new Map<string, string>()
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value)
    },
  }
  writeCalcStorage("take-home", { pay: "5200", meal: true }, storage)
  assert.equal(storageKeyForCalc("take-home"), "kindsem-calc:take-home")
  assert.deepEqual(readCalcStorage("take-home", storage), { pay: "5200", meal: true })
  assert.equal(readCalcStorage("sale-vat", storage), null)
})

test("같은 입력이면 주소를 다시 쓰지 않아도 된다", () => {
  assert.equal(calcStateEquals({ a: "1", b: false }, { a: "1", b: false }), true)
  assert.equal(calcStateEquals({ a: "1", b: false }, { a: "2", b: false }), false)
})
