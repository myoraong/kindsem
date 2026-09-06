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

test("예전에 쓰던 칸 이름은 새 기본값을 덮지 않는다", () => {
  const defaults = { current: "4000", mealExempt: false as boolean }
  const stored = { current: "4500", meal: true }
  const query = { meal: "1" }
  const merged = mergeCalcState(defaults, stored as never, query as never)
  assert.deepEqual(merged, { current: "4500", mealExempt: false })
})

test("예전 주소의 meal 칸은 식대 기본 끄기를 덮지 않는다", () => {
  const defaults = { current: "4000", mealExempt: false as boolean }
  const query = decodeCalcQuery("?current=4500&meal=1", defaults)
  assert.deepEqual(query, { current: "4500" })
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

test("빈 칸도 쿼리에 남겨 기본값과 구분한다", () => {
  const defaults = { income: "5000", mortgage: "", other: "" }
  const encoded = encodeCalcQuery({ income: "5000", mortgage: "120", other: "" })
  assert.equal(encoded, "?income=5000&mortgage=120&other=")
  assert.deepEqual(decodeCalcQuery(encoded, defaults), {
    income: "5000",
    mortgage: "120",
    other: "",
  })
})

test("같은 입력이면 주소를 다시 쓰지 않아도 된다", () => {
  assert.equal(calcStateEquals({ a: "1", b: false }, { a: "1", b: false }), true)
  assert.equal(calcStateEquals({ a: "1", b: false }, { a: "2", b: false }), false)
})
