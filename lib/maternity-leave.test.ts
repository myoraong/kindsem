import assert from "node:assert/strict"
import test from "node:test"
import { MATERNITY_LEAVE } from "./policy.generated.ts"
import { calcMaternityLeave } from "./maternity-leave.ts"

test("우선지원 단태아는 90일 고용보험, 상한 660만", () => {
  const high = calcMaternityLeave({
    monthlyOrdinary: 3_000_000,
    kind: "standard",
    priorityFirm: true,
  })
  assert.ok(high)
  assert.equal(high.periodDays, 90)
  assert.equal(high.eiDays, 90)
  assert.equal(high.eiPay, MATERNITY_LEAVE.cap.standard)
  assert.equal(high.employerPay, 3_000_000 * 2 - Math.round((MATERNITY_LEAVE.cap.standard / 90) * 60))
  assert.equal(high.total, high.eiPay + high.employerPay)

  const under = calcMaternityLeave({
    monthlyOrdinary: 2_000_000,
    kind: "standard",
    priorityFirm: true,
  })
  assert.ok(under)
  assert.equal(under.eiPay, 6_000_000)
  assert.equal(under.employerPay, 0)
  assert.equal(under.total, 6_000_000)
})

test("대기업 단태아는 고용보험 30일만, 한도는 일수 비례", () => {
  const result = calcMaternityLeave({
    monthlyOrdinary: 3_000_000,
    kind: "standard",
    priorityFirm: false,
  })
  assert.ok(result)
  assert.equal(result.eiDays, 30)
  assert.equal(result.eiPay, Math.round((MATERNITY_LEAVE.cap.standard / 90) * 30))
  assert.equal(result.employerPay, 6_000_000)
})

test("다태아는 120일·사업주 75일, 대기업 고용보험 45일", () => {
  const priority = calcMaternityLeave({
    monthlyOrdinary: 2_000_000,
    kind: "multiple",
    priorityFirm: true,
  })
  assert.ok(priority)
  assert.equal(priority.periodDays, 120)
  assert.equal(priority.eiDays, 120)
  assert.equal(priority.employerDays, 75)

  const large = calcMaternityLeave({
    monthlyOrdinary: 2_000_000,
    kind: "multiple",
    priorityFirm: false,
  })
  assert.ok(large)
  assert.equal(large.eiDays, 45)
})

test("미숙아는 100일 상한 7,333,330원", () => {
  const result = calcMaternityLeave({
    monthlyOrdinary: 4_000_000,
    kind: "preterm",
    priorityFirm: true,
  })
  assert.ok(result)
  assert.equal(result.periodDays, 100)
  assert.equal(result.eiPay, MATERNITY_LEAVE.cap.preterm)
})
