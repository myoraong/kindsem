import assert from "node:assert/strict"
import test from "node:test"
import {
  childTaxCredit,
  simplifiedWageTax,
  simplifiedWithholdingTax,
} from "./simplified-wage-tax.ts"

test("350만 원 구간은 가족 1명 127,220원, 4명 49,340원", () => {
  assert.equal(simplifiedWageTax(3_500_000, 1), 127_220)
  assert.equal(simplifiedWageTax(3_519_999, 1), 127_220)
  assert.equal(simplifiedWageTax(3_500_000, 4), 49_340)
  assert.equal(simplifiedWageTax(3_520_000, 1) > 127_220, true)
})

test("770천 원 미만은 0원이고 1천만 원 정액은 별도 행이다", () => {
  assert.equal(simplifiedWageTax(500_000, 1), 0)
  assert.equal(simplifiedWageTax(10_000_000, 1), 1_507_400)
  assert.equal(simplifiedWageTax(10_000_001, 1), 1_507_400 + 25_000)
})

test("1,400만 원 경계는 25,000원 가산과 이어진다", () => {
  const at = simplifiedWageTax(14_000_000, 1)
  assert.equal(at, 1_507_400 + 1_372_000 + 25_000)
  assert.equal(simplifiedWageTax(14_000_001, 1), at)
})

test("가족 12명은 11명 세액에서 10명과 11명의 차이를 뺀다", () => {
  const at10 = simplifiedWageTax(3_500_000, 10)
  const at11 = simplifiedWageTax(3_500_000, 11)
  assert.equal(simplifiedWageTax(3_500_000, 12), at11 - (at10 - at11))
})

test("자녀 2명은 45,830원을 뺀 뒤 10원 미만을 버린다", () => {
  assert.equal(childTaxCredit(2), 45_830)
  assert.equal(childTaxCredit(3), 45_830 + 33_330)
  const row = simplifiedWithholdingTax({
    monthlyWage: 3_500_000,
    family: 1,
    children: 2,
    ratePercent: 100,
  })
  assert.equal(row.tableMonthly, 127_220)
  assert.equal(row.incomeMonthly, 127_220 - 45_830)
  const eighty = simplifiedWithholdingTax({
    monthlyWage: 3_500_000,
    family: 1,
    ratePercent: 80,
  })
  assert.equal(eighty.incomeMonthly, 101_770)
})
