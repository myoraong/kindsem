import assert from "node:assert/strict"
import test from "node:test"
import { calcAcquisition, stampDuty, standardHousingRate } from "./acquisition.ts"
import { calcBrokerage } from "./brokerage.ts"
import { formatKoreanUnit } from "./format.ts"
import { calcCapitalGains, calcEncumberedGift } from "./realty-tax.ts"
import { INCOME_BRACKETS, progressiveTax } from "./tax-brackets.ts"

test("1조 이상을 조 단위로 표시한다", () => {
  assert.equal(formatKoreanUnit(1_000_000_000_000), "1조원")
  assert.equal(formatKoreanUnit(1_234_000_000_000), "1조 2,340억원")
  assert.equal(formatKoreanUnit(500_000_000), "5억원")
})

test("6~9억 주택 일반세율은 소수 다섯째 자리에서 반올림한다", () => {
  assert.equal(standardHousingRate(600_000_000), 0.01)
  assert.equal(standardHousingRate(650_000_000), 0.013333)
  assert.equal(standardHousingRate(900_000_001), 0.03)
})

test("생애최초 감면 후 취득세액의 10%가 지방교육세다", () => {
  const r = calcAcquisition({
    price: 600_000_000,
    homeCount: "1",
    adjustedArea: false,
    over85: false,
    firstHome: true,
  })
  assert.equal(r.baseTax, 6_000_000)
  assert.equal(r.firstHomeRelief, 2_000_000)
  assert.equal(r.acquisitionTax, 4_000_000)
  assert.equal(r.educationTax, 400_000)
})

test("중과 주택 지방교육세는 과세표준의 0.4%다", () => {
  const r = calcAcquisition({
    price: 600_000_000,
    homeCount: "4+",
    adjustedArea: true,
    over85: false,
    firstHome: false,
  })
  assert.equal(r.educationTax, 2_400_000)
})

test("주택 매매 5천만원 미만은 0.6%·25만 원 한도다", () => {
  const r = calcBrokerage({
    deal: "sale",
    property: "house",
    price: 49_999_999,
    includeVat: false,
  })
  assert.equal(r.rate, 0.006)
  assert.equal(r.cap, 250_000)
  assert.equal(r.fee, 250_000)
})

test("주택 매매 5천만 원은 0.5% 구간이다", () => {
  const r = calcBrokerage({
    deal: "sale",
    property: "house",
    price: 50_000_000,
    includeVat: false,
  })
  assert.equal(r.rate, 0.005)
  assert.equal(r.fee, 250_000)
})

test("중개보수와 부가세는 원 미만을 버린다", () => {
  const r = calcBrokerage({
    deal: "sale",
    property: "officetel",
    price: 123_456_789,
    includeVat: true,
  })
  assert.equal(r.fee, Math.floor(123_456_789 * 0.005))
  assert.equal(r.vat, Math.floor(r.fee * 0.1))
  assert.equal(r.total, r.fee + r.vat)
})

test("누진세 산출세액은 원 미만을 버린다", () => {
  const r = progressiveTax(10_000_001, INCOME_BRACKETS)
  assert.equal(r.tax, 600_000)
})

test("주택 소유권 증서 인지세는 1억 이하 비과세다", () => {
  assert.equal(stampDuty(100_000_000, true), 0)
  assert.equal(stampDuty(100_000_001, true), 150_000)
})

test("조정 다주택 중과에는 장기보유특별공제를 넣지 않는다", () => {
  const r = calcCapitalGains({
    buy: 400_000_000,
    sell: 800_000_000,
    costs: 0,
    years: 8,
    homes: "2",
    adjusted: true,
    lived2y: false,
  })
  assert.ok(r)
  assert.equal(r.specialRate, 0)
  assert.equal(r.taxable, 397_500_000)
  assert.equal(r.national, 212_560_000)
  assert.equal(r.local, 21_256_000)
})

test("비조정 1주택은 2년 보유만으로 비과세다", () => {
  const r = calcCapitalGains({
    buy: 400_000_000,
    sell: 800_000_000,
    costs: 0,
    years: 8,
    homes: "1",
    adjusted: false,
    lived2y: false,
  })
  assert.ok(r)
  assert.equal(r.label, "1세대1주택 비과세")
  assert.equal(r.total, 0)
})

test("조정 1주택은 2년 거주가 없으면 비과세가 아니다", () => {
  const r = calcCapitalGains({
    buy: 400_000_000,
    sell: 800_000_000,
    costs: 0,
    years: 8,
    homes: "1",
    adjusted: true,
    lived2y: false,
  })
  assert.ok(r)
  assert.notEqual(r.label, "1세대1주택 비과세")
  assert.ok(r.total > 0)
})

test("부담부증여 채무 양도분은 1주택 비과세를 넣지 않는다", () => {
  const r = calcEncumberedGift({
    property: 800_000_000,
    debt: 200_000_000,
    buy: 300_000_000,
    years: 8,
    relation: "descendant",
  })
  assert.ok(r)
  assert.ok(r.gainsTax > 0)
})
