import assert from "node:assert/strict"
import test from "node:test"
import { carryQuery } from "./calc-carry.ts"

test("실수령에서 이직 비교로 연봉과 식대 설정을 옮긴다", () => {
  const query = carryQuery("take-home", "offer-compare", {
    period: "year",
    current: "5200",
    mealExempt: true,
    youth: "current",
    dependents: "1",
    taxMode: "withholding",
    children: "2",
    withholdRate: "80",
  })
  const params = new URLSearchParams(query.slice(1))
  assert.equal(params.get("current"), "5200")
  assert.equal(params.get("period"), "year")
  assert.equal(params.get("mealExempt"), "1")
  assert.equal(params.get("youth"), "current")
  assert.equal(params.get("taxMode"), "withholding")
  assert.equal(params.get("children"), "2")
  assert.equal(params.get("withholdRate"), "80")
  assert.equal(params.get("offer"), null)
})

test("이직 쪽 제안만 청년 감면이면 실수령은 없음으로 옮긴다", () => {
  const query = carryQuery("offer-compare", "take-home", {
    period: "month",
    current: "350",
    youth: "offer",
    mealExempt: false,
  })
  const params = new URLSearchParams(query.slice(1))
  assert.equal(params.get("current"), "350")
  assert.equal(params.get("period"), "month")
  assert.equal(params.get("youth"), "none")
  assert.equal(params.get("mealExempt"), "0")
})

test("시급 알바 칸은 주휴와 최저임금으로 따라간다", () => {
  const weekly = carryQuery("part-time-month", "weekly-holiday", {
    hourly: "10320",
    weeklyHours: "15",
    attended: false,
  })
  const params = new URLSearchParams(weekly.slice(1))
  assert.equal(params.get("hourly"), "10320")
  assert.equal(params.get("weeklyHours"), "15")
  assert.equal(params.get("pay"), "hourly")
  assert.equal(params.get("attended"), "0")

  const min = carryQuery("min-wage", "part-time-month", {
    pay: "monthly",
    monthlyMan: "220",
    hourly: "10320",
    weeklyHours: "40",
  })
  const minParams = new URLSearchParams(min.slice(1))
  assert.equal(minParams.get("hourly"), null)
  assert.equal(minParams.get("weeklyHours"), "40")
  assert.equal(minParams.get("pay"), null)
})

test("집값과 전월세와 대출 원금은 짝 계산기로만 간다", () => {
  const house = new URLSearchParams(
    carryQuery("acquisition", "closing-cost", {
      price: "65000",
      homes: "1",
      first: true,
      adjusted: false,
    }).slice(1),
  )
  assert.equal(house.get("price"), "65000")
  assert.equal(house.get("first"), "1")

  const rent = new URLSearchParams(
    carryQuery("jeonse-vs-rent", "rent-convert", {
      jeonse: "30000",
      deposit: "5000",
      monthly: "80",
      base: "2.5",
      interest: "3",
    }).slice(1),
  )
  assert.equal(rent.get("jeonse"), "30000")
  assert.equal(rent.get("monthly"), "80")
  assert.equal(rent.get("interest"), null)

  const loan = new URLSearchParams(
    carryQuery("mortgage", "loan-interest", {
      principal: "20000",
      rate: "3.6",
      years: "30",
      method: "equal-principal",
    }).slice(1),
  )
  assert.equal(loan.get("principal"), "20000")
  assert.equal(loan.get("rate"), "3.6")
  assert.equal(loan.get("method"), "equal-principal")
  assert.equal(loan.get("years"), null)

  assert.equal(carryQuery("take-home", "car-tax", { current: "4000" }), "")
  assert.equal(carryQuery("take-home", "take-home", { current: "4000" }), "")
  assert.equal(carryQuery("take-home", "offer-compare", null), "")
})

test("전월세 보증금은 복비와 이사 총액 사이에서만 옮긴다", () => {
  const toMove = new URLSearchParams(
    carryQuery("brokerage", "moving", {
      deal: "wolse",
      property: "house",
      price: "5000",
      monthly: "65",
      vat: true,
    }).slice(1),
  )
  assert.equal(toMove.get("deal"), "wolse")
  assert.equal(toMove.get("deposit"), "5000")
  assert.equal(toMove.get("monthly"), "65")
  assert.equal(toMove.get("price"), null)
  assert.equal(toMove.get("vat"), null)

  assert.equal(
    carryQuery("brokerage", "moving", { deal: "sale", property: "house", price: "50000" }),
    "",
  )
  assert.equal(
    carryQuery("brokerage", "moving", { deal: "jeonse", property: "presale", price: "8000" }),
    "",
  )

  const toFee = new URLSearchParams(
    carryQuery("moving", "brokerage", {
      deal: "jeonse",
      deposit: "20000",
      monthly: "50",
      loan: "10000",
    }).slice(1),
  )
  assert.equal(toFee.get("deal"), "jeonse")
  assert.equal(toFee.get("price"), "20000")
  assert.equal(toFee.get("property"), "house")
  assert.equal(toFee.get("monthly"), null)
  assert.equal(toFee.get("loan"), null)
})

test("살 때 매매가는 매매 복비로, 전세 보증금은 매매가로 쓰지 않는다", () => {
  const toFee = new URLSearchParams(
    carryQuery("closing-cost", "brokerage", { price: "65000", homes: "1", first: true }).slice(1),
  )
  assert.equal(toFee.get("deal"), "sale")
  assert.equal(toFee.get("property"), "house")
  assert.equal(toFee.get("price"), "65000")
  assert.equal(toFee.get("homes"), null)
  assert.equal(toFee.get("first"), null)

  const back = new URLSearchParams(
    carryQuery("brokerage", "acquisition", {
      deal: "sale",
      property: "officetel",
      price: "80000",
      monthly: "65",
    }).slice(1),
  )
  assert.equal(back.get("price"), "80000")
  assert.equal(back.get("deal"), null)
  assert.equal(back.get("monthly"), null)

  assert.equal(
    carryQuery("brokerage", "closing-cost", { deal: "wolse", price: "5000", monthly: "65" }),
    "",
  )
})

test("월급 실수령은 일할 계산으로, 연봉 입력은 옮기지 않는다", () => {
  const month = new URLSearchParams(
    carryQuery("take-home", "prorate-pay", { period: "month", current: "320" }).slice(1),
  )
  assert.equal(month.get("pay"), "320")
  assert.equal(carryQuery("take-home", "prorate-pay", { period: "year", current: "4000" }), "")

  const back = new URLSearchParams(
    carryQuery("prorate-pay", "take-home", { pay: "280", workDays: "10" }).slice(1),
  )
  assert.equal(back.get("current"), "280")
  assert.equal(back.get("period"), "month")
  assert.equal(back.get("workDays"), null)
})
