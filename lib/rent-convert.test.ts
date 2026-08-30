import assert from "node:assert/strict"
import test from "node:test"
import { calcRentConvert, statutoryConvertCap } from "./rent-convert.ts"

test("상한은 연 10%와 기준금리+2%p 중 낮은 쪽", () => {
  assert.equal(statutoryConvertCap(0.0275), 0.0475)
  assert.equal(statutoryConvertCap(0.09), 0.1)
})

test("전세 2억을 보증금 5천으로 바꾸면 법정 상한 월세", () => {
  const result = calcRentConvert({
    mode: "to-monthly",
    jeonse: 200_000_000,
    deposit: 50_000_000,
    monthly: 0,
    agreedRate: 0.0475,
    baseRate: 0.0275,
  })
  assert.ok(result)
  assert.equal(result.converted, 150_000_000)
  assert.equal(result.monthlyCap, 593_750)
  assert.equal(result.amount, 593_750)
  assert.equal(result.overCap, false)
})

test("약정 전환율이 상한을 넘으면 상한 월세를 낸다", () => {
  const result = calcRentConvert({
    mode: "to-monthly",
    jeonse: 200_000_000,
    deposit: 50_000_000,
    monthly: 0,
    agreedRate: 0.06,
    baseRate: 0.0275,
  })
  assert.ok(result)
  assert.equal(result.overCap, true)
  assert.equal(result.amount, 593_750)
  assert.ok(result.monthlyAgreed > result.monthlyCap)
})

test("월세를 전세로 환산하면 월세×12÷상한 + 남은 보증금", () => {
  const result = calcRentConvert({
    mode: "to-jeonse",
    jeonse: 0,
    deposit: 50_000_000,
    monthly: 593_750,
    agreedRate: 0.0475,
    baseRate: 0.0275,
  })
  assert.ok(result)
  assert.equal(result.amount, 200_000_000)
})
