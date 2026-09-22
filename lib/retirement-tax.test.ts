import assert from "node:assert/strict"
import test from "node:test"
import { manwonToWon, wonToManwonField } from "./format.ts"
import {
  calcRetirementTax,
  convertedSalaryDeduction,
  retirementTaxQuery,
  serviceYearsDeduction,
} from "./retirement-tax.ts"

test("근속연수공제는 제48조 표와 같다", () => {
  assert.equal(serviceYearsDeduction(1), 1_000_000)
  assert.equal(serviceYearsDeduction(5), 5_000_000)
  assert.equal(serviceYearsDeduction(10), 15_000_000)
  assert.equal(serviceYearsDeduction(20), 40_000_000)
  assert.equal(serviceYearsDeduction(21), 43_000_000)
})

test("환산급여공제는 제48조 표와 같다", () => {
  assert.equal(convertedSalaryDeduction(8_000_000), 8_000_000)
  assert.equal(convertedSalaryDeduction(70_000_000), 8_000_000 + 62_000_000 * 0.6)
  assert.equal(convertedSalaryDeduction(100_000_000), 45_200_000 + 30_000_000 * 0.55)
})

test("퇴직금이 근속연수공제보다 작으면 세금이 없다", () => {
  const r = calcRetirementTax({ payout: 3_000_000, years: 5 })
  assert.ok(r)
  assert.equal(r.serviceDeduction, 3_000_000)
  assert.equal(r.total, 0)
})

test("퇴직금 1억·근속 10년은 환산급여 1억 200만이다", () => {
  const r = calcRetirementTax({ payout: 100_000_000, years: 10 })
  assert.ok(r)
  assert.equal(r.serviceDeduction, 15_000_000)
  assert.equal(r.converted, 102_000_000)
  assert.equal(r.convertedDeduction, 62_600_000)
  assert.equal(r.taxable, 39_400_000)
  assert.equal(r.national, 3_875_000)
  assert.equal(r.local, 387_500)
  assert.equal(r.total, 4_262_500)
})

test("퇴직금 원을 퇴직소득세 만원 칸으로 넘기면 같은 원으로 돌아온다", () => {
  for (const won of [10_000, 9_000_000, 9_016_438, 1]) {
    assert.equal(manwonToWon(Number(wonToManwonField(won))), won)
  }
  assert.equal(wonToManwonField(9_000_000), "900")
  assert.equal(wonToManwonField(9_016_438), "901.6438")
})

test("1년 이상 퇴직금만 퇴직소득세 주소로 넘긴다", () => {
  const query = retirementTaxQuery(9_016_438, 3.005479)
  const params = new URLSearchParams(query.slice(1))
  assert.equal(params.get("payout"), "901.6438")
  assert.equal(params.get("years"), "3")
  assert.equal(retirementTaxQuery(9_000_000, 0.9), "")
  assert.equal(retirementTaxQuery(0, 3), "")
  assert.equal(retirementTaxQuery(9_000_000, 1), "?payout=900&years=1")
})
