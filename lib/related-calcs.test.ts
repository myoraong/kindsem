import assert from "node:assert/strict"
import test from "node:test"
import { getCalculator } from "./catalog.ts"
import { relatedCalculators } from "./related-calcs.ts"

test("실수령 다음에 연봉비교를 보여 준다", () => {
  const rows = relatedCalculators("take-home")
  assert.equal(rows[0]?.slug, "offer-compare")
  assert.equal(rows[1]?.slug, "weekly-holiday")
  assert.ok(rows.length >= 2 && rows.length <= 4)
})

test("전월세 전환 다음에 전세 vs 월세", () => {
  assert.equal(relatedCalculators("rent-convert")[0]?.slug, "jeonse-vs-rent")
})

test("연장수당 다음에 주휴", () => {
  assert.equal(relatedCalculators("overtime-pay")[0]?.slug, "weekly-holiday")
})

test("취득세 다음에 살 때 총비용", () => {
  assert.equal(relatedCalculators("acquisition")[0]?.slug, "closing-cost")
})

test("양도세 다음에는 보유세·취득세·법인 양도세", () => {
  assert.deepEqual(
    relatedCalculators("capital-gains").map((item) => item.slug).slice(0, 3),
    ["holding-tax", "acquisition", "corporate-gains"],
  )
})

test("등록면허세 다음에는 증여·상속", () => {
  assert.equal(relatedCalculators("license-tax")[0]?.slug, "gift-tax")
  assert.equal(relatedCalculators("license-tax")[1]?.slug, "inheritance")
})

test("퇴직금 다음에 퇴직소득세", () => {
  assert.equal(relatedCalculators("severance")[0]?.slug, "retirement-tax")
})

test("상속세 다음에 증여세", () => {
  assert.equal(relatedCalculators("inheritance")[0]?.slug, "gift-tax")
})

test("사다리 다음에 더치페이", () => {
  assert.equal(relatedCalculators("ladder")[0]?.slug, "dutch")
  assert.equal(relatedCalculators("dutch")[0]?.slug, "ladder")
})

test("부가세 다음에는 직구·자동차 세금을 보여 준다", () => {
  const slugs = relatedCalculators("sale-vat").map((item) => item.slug)
  assert.deepEqual(slugs.slice(0, 3), ["import-duty", "vehicle-tax", "car-tax"])
  assert.ok(!slugs.slice(0, 3).includes("dutch"))
  assert.ok(!slugs.slice(0, 3).includes("quick"))
})

test("예적금 다음에는 실수령·대출이자를 보여 준다", () => {
  assert.equal(relatedCalculators("deposit")[0]?.slug, "take-home")
  assert.equal(relatedCalculators("deposit")[1]?.slug, "loan-interest")
})

test("자동차세 다음에는 자동차 취득세·직구를 보여 준다", () => {
  const slugs = relatedCalculators("car-tax").map((item) => item.slug)
  assert.equal(slugs[0], "vehicle-tax")
  assert.equal(slugs[1], "import-duty")
  assert.ok(!slugs.includes("acquisition"))
  assert.ok(!slugs.includes("closing-cost"))
})

test("자동차 취득세 이어서 보기는 주택 취득세로 새지 않는다", () => {
  const slugs = relatedCalculators("vehicle-tax").map((item) => item.slug)
  assert.equal(slugs[0], "car-tax")
  assert.ok(!slugs.includes("acquisition"))
  assert.ok(!slugs.includes("closing-cost"))
})

test("이어서 볼 것은 카탈로그에 있는 슬로그만", () => {
  for (const slug of ["take-home", "import-duty", "parental-leave", "jeonse-vs-rent", "ladder"]) {
    for (const item of relatedCalculators(slug)) {
      assert.ok(getCalculator(item.slug))
      assert.notEqual(item.slug, slug)
    }
  }
})
