import assert from "node:assert/strict"
import test from "node:test"
import { calcVehicleAcquisition } from "./vehicle.ts"

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

test("영업용은 4%", () => {
  const result = calcVehicleAcquisition({ base: 20_000_000, kind: "commercial" })
  assert.ok(result)
  assert.equal(result.acquisition, 800_000)
})
