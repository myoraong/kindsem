import assert from "node:assert/strict"
import test from "node:test"
import { calcGiftTax, calcInheritance } from "./realty-tax.ts"

test("배우자·자녀면 일괄 5억과 배우자 최소 5억을 더한다", () => {
  const r = calcInheritance({ estate: 800_000_000, heirs: "spouse-children" })
  assert.ok(r)
  assert.equal(r.deduction, 1_000_000_000)
  assert.equal(r.tax, 0)
})

test("자녀만이면 일괄공제 5억만 뺀다", () => {
  const r = calcInheritance({ estate: 800_000_000, heirs: "children" })
  assert.ok(r)
  assert.equal(r.lump, 500_000_000)
  assert.equal(r.spouseDeduction, 0)
  assert.equal(r.taxable, 300_000_000)
  assert.equal(r.tax, 50_000_000)
})

test("배우자 단독은 일괄공제 대신 기초 2억이다", () => {
  const r = calcInheritance({ estate: 800_000_000, heirs: "spouse-only" })
  assert.ok(r)
  assert.equal(r.lump, 0)
  assert.equal(r.basic, 200_000_000)
  assert.equal(r.spouseDeduction, 500_000_000)
  assert.equal(r.taxable, 100_000_000)
  assert.equal(r.tax, 10_000_000)
})

test("빚은 상속재산에서 빼고 공제한다", () => {
  const r = calcInheritance({
    estate: 1_200_000_000,
    debts: 200_000_000,
    heirs: "spouse-children",
  })
  assert.ok(r)
  assert.equal(r.net, 1_000_000_000)
  assert.equal(r.tax, 0)
})

test("배우자 있음 예전 인자는 배우자·자녀로 본다", () => {
  const r = calcInheritance({ estate: 800_000_000, spouse: true })
  assert.ok(r)
  assert.equal(r.heirs, "spouse-children")
  assert.equal(r.tax, 0)
})

test("자녀 증여 5천만은 공제 한도라 세금이 없다", () => {
  const r = calcGiftTax({ amount: 50_000_000, relation: "descendant" })
  assert.ok(r)
  assert.equal(r.tax, 0)
  assert.equal(r.remaining, 0)
})

test("10년 내 같은 사람 증여를 합산하고 기납부를 뺀다", () => {
  const first = calcGiftTax({ amount: 80_000_000, relation: "descendant" })
  const second = calcGiftTax({ amount: 50_000_000, relation: "descendant", prior: 80_000_000 })
  assert.ok(first)
  assert.ok(second)
  assert.equal(first.taxable, 30_000_000)
  assert.equal(second.prior, 80_000_000)
  assert.equal(second.taxable, 80_000_000)
  assert.equal(second.tax, second.taxable * 0.1 - first.tax)
})
