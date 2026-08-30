import {
  CAPITAL_GAINS,
  CORP_EXTRA_LAND,
  GIFT_DEDUCTIONS,
  HOLDING,
  INHERITANCE,
  LICENSE,
} from "@/lib/policy.generated"
import { CORP_BRACKETS, GIFT_BRACKETS, INCOME_BRACKETS, progressiveTax } from "@/lib/tax-brackets"

export type Homes = "1" | "2" | "3+"
export type GiftRelation = "spouse" | "ascendant" | "descendant" | "other"

export function holdingSpecialRate(years: number, oneHouseLived: boolean) {
  if (years < 3) return 0
  if (oneHouseLived) {
    return Math.min(CAPITAL_GAINS.specialOneHouseMax, years * CAPITAL_GAINS.specialOneHousePerYear)
  }
  return Math.min(
    CAPITAL_GAINS.specialMax,
    CAPITAL_GAINS.specialStart + (years - 3) * CAPITAL_GAINS.specialStep,
  )
}

export function giftDeduction(relation: GiftRelation) {
  if (relation === "spouse") return GIFT_DEDUCTIONS.spouse
  if (relation === "other") return GIFT_DEDUCTIONS.other
  if (relation === "ascendant") return GIFT_DEDUCTIONS.ascendant
  return GIFT_DEDUCTIONS.descendant
}

export function calcCapitalGains(input: {
  buy: number
  sell: number
  costs: number
  years: number
  homes: Homes
  adjusted: boolean
  lived2y: boolean
}) {
  const profit = input.sell - input.buy - input.costs
  if (input.sell <= 0) return null
  if (profit <= 0) {
    return {
      profit,
      taxable: 0,
      specialRate: 0,
      national: 0,
      local: 0,
      total: 0,
      label: "양도차익 없음",
    }
  }

  const oneHouse = input.homes === "1"
  const canExempt = oneHouse && input.lived2y && input.years >= 2
  if (canExempt && input.sell <= CAPITAL_GAINS.houseExempt) {
    return {
      profit,
      taxable: 0,
      specialRate: 0,
      national: 0,
      local: 0,
      total: 0,
      label: "1세대1주택 비과세",
    }
  }

  let taxableGain = profit
  if (canExempt && input.sell > CAPITAL_GAINS.houseExempt) {
    taxableGain = profit * ((input.sell - CAPITAL_GAINS.houseExempt) / input.sell)
  }

  const heavy = input.adjusted && input.homes !== "1" && input.years >= 2
  const surcharge = heavy ? (input.homes === "2" ? CAPITAL_GAINS.surcharge2 : CAPITAL_GAINS.surcharge3) : 0
  const specialRate = holdingSpecialRate(input.years, oneHouse && input.lived2y && !heavy)
  const afterSpecial = taxableGain * (1 - specialRate)
  const taxable = Math.max(0, afterSpecial - CAPITAL_GAINS.basicDeduction)

  let national: number
  let label: string
  if (input.years < 1) {
    national = taxable * CAPITAL_GAINS.under1y
    label = `1년 미만 ${Math.round(CAPITAL_GAINS.under1y * 100)}%`
  } else if (input.years < 2) {
    national = taxable * CAPITAL_GAINS.under2y
    label = `2년 미만 ${Math.round(CAPITAL_GAINS.under2y * 100)}%`
  } else {
    const base = progressiveTax(taxable, INCOME_BRACKETS)
    national = base.tax + taxable * surcharge
    label = heavy ? `기본세율 +${Math.round(surcharge * 100)}%p 중과` : "기본세율"
  }

  const local = national * CAPITAL_GAINS.localIncome
  return {
    profit,
    taxable,
    specialRate,
    national,
    local,
    total: national + local,
    label,
  }
}

export function calcCorporateGains(input: {
  buy: number
  sell: number
  costs: number
  unbusinessLand: boolean
}) {
  const profit = input.sell - input.buy - input.costs
  if (input.sell <= 0) return null
  if (profit <= 0) {
    return { profit, corp: 0, extra: 0, total: 0, label: "양도차익 없음" }
  }
  const corp = progressiveTax(profit, CORP_BRACKETS).tax
  const extra = input.unbusinessLand ? profit * CORP_EXTRA_LAND : 0
  return {
    profit,
    corp,
    extra,
    total: corp + extra,
    label: input.unbusinessLand ? "법인세 + 비사업용토지 추가" : "법인세",
  }
}

export function calcHoldingTax(input: { price: number; homes: Homes }) {
  if (input.price <= 0) return null
  const standard = input.price * HOLDING.fairMarket
  const property = propertyTaxOn(standard, input.homes === "1")
  const city = standard * HOLDING.cityRate
  const education = property * HOLDING.educationShare
  const deduction = input.homes === "1" ? HOLDING.oneHouseDeduction : HOLDING.otherDeduction
  const jongbuBase = Math.max(0, standard - deduction)
  const jongbuRate =
    input.homes === "3+" ? HOLDING.jongbuThree : input.homes === "1" ? HOLDING.jongbuOne : HOLDING.jongbuTwo
  const jongbu = jongbuBase * jongbuRate
  const rural = input.homes === "1" ? 0 : jongbu * HOLDING.ruralShare
  const total = property + city + education + jongbu + rural
  return { standard, property, city, education, jongbu, rural, total }
}

function propertyTaxOn(standard: number, oneHouse: boolean) {
  const rates = oneHouse ? HOLDING.propertyOneHouse : HOLDING.propertyOther
  let tax = 0
  let prev = 0
  for (const row of rates) {
    const slice = Math.min(standard, row.cap) - prev
    if (slice <= 0) break
    tax += slice * row.rate
    prev = row.cap
    if (standard <= row.cap) break
  }
  return tax
}

export function calcGiftTax(input: { amount: number; relation: GiftRelation }) {
  if (input.amount <= 0) return null
  const deduction = giftDeduction(input.relation)
  const taxable = Math.max(0, input.amount - deduction)
  const { tax, rate } = progressiveTax(taxable, GIFT_BRACKETS)
  return { deduction, taxable, tax, rate }
}

export function calcInheritance(input: { estate: number; spouse: boolean }) {
  if (input.estate <= 0) return null
  const lump = INHERITANCE.lump
  const spouseDeduction = input.spouse ? INHERITANCE.spouseMin : 0
  const deduction = lump + spouseDeduction
  const taxable = Math.max(0, input.estate - deduction)
  const { tax, rate } = progressiveTax(taxable, GIFT_BRACKETS)
  return { lump, spouseDeduction, deduction, taxable, tax, rate }
}

export function calcLicenseTax(input: { value: number; kind: "inherit" | "gift" }) {
  if (input.value <= 0) return null
  const rate = input.kind === "inherit" ? LICENSE.inherit : LICENSE.gift
  const tax = input.value * rate
  const education = tax * LICENSE.educationShare
  return { rate, tax, education, total: tax + education }
}

export function calcEncumberedGift(input: {
  property: number
  debt: number
  buy: number
  years: number
  relation: GiftRelation
}) {
  if (input.property <= 0) return null
  const debt = Math.min(input.debt, input.property)
  const giftAmount = Math.max(0, input.property - debt)
  const gift = calcGiftTax({ amount: giftAmount, relation: input.relation })
  const buyShare = input.property > 0 ? input.buy * (debt / input.property) : 0
  const gains = calcCapitalGains({
    buy: buyShare,
    sell: debt,
    costs: 0,
    years: input.years,
    homes: "1",
    adjusted: false,
    lived2y: false,
  })
  return {
    giftAmount,
    debt,
    giftTax: gift?.tax ?? 0,
    gainsTax: gains?.total ?? 0,
    total: (gift?.tax ?? 0) + (gains?.total ?? 0),
  }
}
