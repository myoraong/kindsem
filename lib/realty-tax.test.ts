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

test("자녀 7명이면 인적공제가 일괄 5억보다 크다", () => {
  const r = calcInheritance({
    estate: 1_200_000_000,
    heirs: "spouse-children",
    children: 7,
  })
  assert.ok(r)
  assert.equal(r.usedLump, false)
  assert.equal(r.childDeduction, 350_000_000)
  assert.equal(r.basic, 200_000_000)
  assert.equal(r.spouseDeduction, 500_000_000)
  assert.equal(r.deduction, 1_050_000_000)
})

test("미성년 자녀는 자녀공제와 미성년공제를 같이 받는다", () => {
  const r = calcInheritance({
    estate: 800_000_000,
    heirs: "children",
    children: 2,
    minorCount: 2,
    minorAge: 0,
  })
  assert.ok(r)
  assert.equal(r.itemized, 680_000_000)
  assert.equal(r.usedLump, false)
  assert.equal(r.childDeduction, 100_000_000)
  assert.equal(r.minorDeduction, 380_000_000)
  assert.equal(r.lump, 0)
})

test("며느리·사위를 자녀 수에 넣지 않으면 자녀공제가 늘지 않는다", () => {
  const withKids = calcInheritance({
    estate: 800_000_000,
    heirs: "spouse-children",
    children: 2,
  })
  const same = calcInheritance({
    estate: 800_000_000,
    heirs: "spouse-children",
    children: 2,
  })
  assert.ok(withKids)
  assert.ok(same)
  assert.equal(withKids.itemized, same.itemized)
  assert.equal(withKids.itemized, 300_000_000)
  assert.equal(withKids.usedLump, true)
})

test("대습 며느리 65세는 자녀공제 없이 경로공제만 더한다", () => {
  const without = calcInheritance({
    estate: 800_000_000,
    heirs: "children",
    children: 6,
  })
  const withElderly = calcInheritance({
    estate: 800_000_000,
    heirs: "children",
    children: 6,
    elderlyCount: 1,
  })
  assert.ok(without)
  assert.ok(withElderly)
  assert.equal(without.itemized, 500_000_000)
  assert.equal(without.usedLump, true)
  assert.equal(withElderly.usedLump, false)
  assert.equal(withElderly.childDeduction, 300_000_000)
  assert.equal(withElderly.elderlyDeduction, 50_000_000)
  assert.equal(withElderly.deduction, 550_000_000)
})

test("금융재산공제 2천만 이하는 전액이다", () => {
  const r = calcInheritance({
    estate: 800_000_000,
    heirs: "children",
    finance: 15_000_000,
  })
  assert.ok(r)
  assert.equal(r.financeDeduction, 15_000_000)
  assert.equal(r.deduction, 515_000_000)
})

test("금융재산공제 초과는 20%와 2천만 중 큰 값이고 한도는 2억이다", () => {
  const low = calcInheritance({
    estate: 800_000_000,
    heirs: "children",
    finance: 30_000_000,
  })
  const high = calcInheritance({
    estate: 2_000_000_000,
    heirs: "children",
    finance: 1_500_000_000,
  })
  assert.ok(low)
  assert.ok(high)
  assert.equal(low.financeDeduction, 20_000_000)
  assert.equal(high.financeDeduction, 200_000_000)
})

test("배우자·자녀인데 자녀가 0명이면 일괄공제를 쓰지 못한다", () => {
  const r = calcInheritance({
    estate: 800_000_000,
    heirs: "spouse-children",
    children: 0,
  })
  assert.ok(r)
  assert.equal(r.usedLump, false)
  assert.equal(r.basic, 200_000_000)
  assert.equal(r.spouseDeduction, 500_000_000)
  assert.equal(r.deduction, 700_000_000)
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
