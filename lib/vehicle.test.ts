import assert from "node:assert/strict"
import test from "node:test"
import { calcCarTax, calcVehicleAcquisition } from "./vehicle.ts"

test("비영업용 승용 3천만 원은 취득세 7% + 교육세 1%", () => {
  const result = calcVehicleAcquisition({ base: 30_000_000, kind: "passenger" })
  assert.ok(result)
  assert.equal(result.rate, 0.07)
  assert.equal(result.acquisition, 2_100_000)
  assert.equal(result.education, 300_000)
  assert.equal(result.total, 2_400_000)
})

test("경차 1,500만 원은 산출 60만이 75만 감면 한도 안이라 0원", () => {
  const result = calcVehicleAcquisition({ base: 15_000_000, kind: "compact" })
  assert.ok(result)
  assert.equal(result.rawAcq, 600_000)
  assert.equal(result.relief, 600_000)
  assert.equal(result.acquisition, 0)
  assert.equal(result.education, 0)
  assert.equal(result.total, 0)
})

test("경차 2,500만 원은 75만을 빼고 교육세도 같은 비율로 줄인다", () => {
  const result = calcVehicleAcquisition({ base: 25_000_000, kind: "compact" })
  assert.ok(result)
  assert.equal(result.rawAcq, 1_000_000)
  assert.equal(result.relief, 750_000)
  assert.equal(result.acquisition, 250_000)
  assert.equal(result.education, 25_000)
  assert.equal(result.total, 275_000)
})

test("비영업 1,998cc 새 차는 cc당 200원, 교육세 30%", () => {
  const result = calcCarTax({ kind: "private", cc: 1998, ageYears: 1 })
  assert.ok(result)
  assert.equal(result.raw, 399_600)
  assert.equal(result.reliefRate, 0)
  assert.equal(result.tax, 399_600)
  assert.equal(result.education, 119_880)
  assert.equal(result.total, 519_480)
})

test("비영업 1,600cc는 140원, 차령 12년은 본세 50%", () => {
  const fresh = calcCarTax({ kind: "private", cc: 1600, ageYears: 2 })
  assert.ok(fresh)
  assert.equal(fresh.raw, 224_000)
  const old = calcCarTax({ kind: "private", cc: 1600, ageYears: 12 })
  assert.ok(old)
  assert.equal(old.reliefRate, 0.5)
  assert.equal(old.tax, 112_000)
  assert.equal(old.education, 33_600)
})

test("전기 비영업은 10만 원, 차령 경감을 쓰지 않는다", () => {
  const result = calcCarTax({ kind: "ev", cc: 0, ageYears: 8 })
  assert.ok(result)
  assert.equal(result.tax, 100_000)
  assert.equal(result.education, 30_000)
  assert.equal(result.total, 130_000)
})

test("영업용은 4%", () => {
  const result = calcVehicleAcquisition({ base: 20_000_000, kind: "commercial" })
  assert.ok(result)
  assert.equal(result.acquisition, 800_000)
})
