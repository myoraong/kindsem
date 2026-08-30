import assert from "node:assert/strict"
import test from "node:test"
import { calcImportDuty } from "./import-duty.ts"

test("일반 미화 150달러 이하는 목록통관 비과세", () => {
  const result = calcImportDuty({
    priceUsd: 150,
    fxKrw: 1_400,
    origin: "other",
    listExcluded: false,
  })
  assert.ok(result)
  assert.equal(result.taxFree, "list")
  assert.equal(result.duty, 0)
  assert.equal(result.vat, 0)
  assert.equal(result.landed, 210_000)
})

test("미국발 180달러는 목록통관, 배제되면 소액면세가 아니다", () => {
  const listed = calcImportDuty({
    priceUsd: 180,
    fxKrw: 1_400,
    origin: "us",
    listExcluded: false,
  })
  assert.ok(listed)
  assert.equal(listed.taxFree, "list")

  const excluded = calcImportDuty({
    priceUsd: 180,
    fxKrw: 1_400,
    origin: "us",
    listExcluded: true,
  })
  assert.ok(excluded)
  assert.equal(excluded.taxed, true)
  assert.equal(excluded.hsUnknown, true)
  assert.equal(excluded.duty, null)
})

test("목록통관 배제·150달러 이하는 소액면세", () => {
  const result = calcImportDuty({
    priceUsd: 120,
    fxKrw: 1_400,
    origin: "other",
    listExcluded: true,
  })
  assert.ok(result)
  assert.equal(result.taxFree, "de-minimis")
  assert.equal(result.vat, 0)
})

test("관세를 넣으면 부가세는 (물품+관세)×10%", () => {
  const result = calcImportDuty({
    priceUsd: 200,
    fxKrw: 1_000,
    origin: "other",
    listExcluded: false,
    dutyWon: 20_000,
  })
  assert.ok(result)
  assert.equal(result.goodsKrw, 200_000)
  assert.equal(result.duty, 20_000)
  assert.equal(result.vat, 22_000)
  assert.equal(result.totalTax, 42_000)
  assert.equal(result.landed, 242_000)
})

test("관세율만 넣어도 같은 부가세 식", () => {
  const result = calcImportDuty({
    priceUsd: 200,
    fxKrw: 1_000,
    origin: "other",
    listExcluded: false,
    dutyRate: 0.08,
  })
  assert.ok(result)
  assert.equal(result.duty, 16_000)
  assert.equal(result.vat, 21_600)
})
