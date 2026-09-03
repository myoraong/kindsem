import { truncWon } from "./format.ts"
import {
  CAPITAL_GAINS,
  CORP_EXTRA_LAND,
  GIFT_DEDUCTIONS,
  HOLDING,
  INHERITANCE,
  LICENSE,
} from "./policy.generated.ts"
import { CORP_BRACKETS, GIFT_BRACKETS, INCOME_BRACKETS, progressiveTax } from "./tax-brackets.ts"

export type Homes = "1" | "2" | "3+"
export type GiftRelation = "spouse" | "ascendant" | "descendant" | "other"
export type InheritanceHeirs = "spouse-children" | "children" | "spouse-only"

/** 상증세법 제47조 ②. 10년 합산은 1천만 원 이상일 때만. */
const GIFT_LOOKBACK_FLOOR = 10_000_000

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
  /** 부담부증여 채무 양도분은 1주택 비과세를 넣지 않습니다. */
  allowOneHouseExempt?: boolean
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
  const residenceOk = input.lived2y || !input.adjusted
  const canExempt =
    input.allowOneHouseExempt !== false && oneHouse && input.years >= 2 && residenceOk
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
  const specialRate = heavy ? 0 : holdingSpecialRate(input.years, oneHouse && input.lived2y)
  const afterSpecial = taxableGain * (1 - specialRate)
  const taxable = Math.max(0, truncWon(afterSpecial - CAPITAL_GAINS.basicDeduction))

  let national: number
  let label: string
  if (input.years < 1) {
    national = truncWon(taxable * CAPITAL_GAINS.under1y)
    label = `1년 미만 ${Math.round(CAPITAL_GAINS.under1y * 100)}%`
  } else if (input.years < 2) {
    national = truncWon(taxable * CAPITAL_GAINS.under2y)
    label = `2년 미만 ${Math.round(CAPITAL_GAINS.under2y * 100)}%`
  } else {
    const base = progressiveTax(taxable, INCOME_BRACKETS)
    national = truncWon(base.tax + taxable * surcharge)
    label = heavy ? `기본세율 +${Math.round(surcharge * 100)}%p 중과` : "기본세율"
  }

  const local = truncWon(national * CAPITAL_GAINS.localIncome)
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
  const extra = input.unbusinessLand ? truncWon(profit * CORP_EXTRA_LAND) : 0
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
  const standard = truncWon(input.price * HOLDING.fairMarket)
  const property = truncWon(propertyTaxOn(standard, input.homes === "1"))
  const city = truncWon(standard * HOLDING.cityRate)
  const education = truncWon(property * HOLDING.educationShare)
  const deduction = input.homes === "1" ? HOLDING.oneHouseDeduction : HOLDING.otherDeduction
  const jongbuBase = Math.max(0, standard - deduction)
  const jongbuRate =
    input.homes === "3+" ? HOLDING.jongbuThree : input.homes === "1" ? HOLDING.jongbuOne : HOLDING.jongbuTwo
  const jongbu = truncWon(jongbuBase * jongbuRate)
  const rural = input.homes === "1" ? 0 : truncWon(jongbu * HOLDING.ruralShare)
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

export function calcGiftTax(input: { amount: number; relation: GiftRelation; prior?: number }) {
  if (input.amount <= 0) return null
  const deduction = giftDeduction(input.relation)
  const prior = Math.max(0, input.prior ?? 0)
  const combined = input.amount + prior
  const addPrior = prior > 0 && combined >= GIFT_LOOKBACK_FLOOR
  const base = addPrior ? combined : input.amount
  const taxable = Math.max(0, base - deduction)
  const { tax: grossTax, rate } = progressiveTax(taxable, GIFT_BRACKETS)
  const prevTaxable = addPrior ? Math.max(0, prior - deduction) : 0
  const prevTax = addPrior ? progressiveTax(prevTaxable, GIFT_BRACKETS).tax : 0
  const tax = Math.max(0, grossTax - prevTax)
  return {
    deduction,
    taxable,
    tax,
    rate,
    prior: addPrior ? prior : 0,
    remaining: Math.max(0, deduction - base),
  }
}

/** 상증세법 제22조. 순금융재산 2천만 이하 전액, 초과 시 max(2천만, 20%) 한도 2억. */
export function financeInheritanceDeduction(netFinance: number) {
  const amount = Math.max(0, netFinance)
  if (amount <= 0) return 0
  if (amount <= INHERITANCE.financeFull) return amount
  return Math.min(
    INHERITANCE.financeCap,
    Math.max(INHERITANCE.financeFloor, truncWon(amount * INHERITANCE.financeRate)),
  )
}

export function calcInheritance(input: {
  estate: number
  debts?: number
  heirs?: InheritanceHeirs
  spouse?: boolean
  /** 피상속인의 자녀 수. 며느리·사위는 넣지 않습니다. */
  children?: number
  /** 상속인(배우자 제외)·동거가족 중 미성년 인원. 자녀와 겹치면 자녀공제와 함께 갑니다. */
  minorCount?: number
  /** 미성년 대표 만나이. 남은 연수는 19세 − 나이입니다. */
  minorAge?: number
  /** 상속인(배우자 제외)·동거가족 중 65세 이상. 대습한 며느리·사위가 65세이면 여기. */
  elderlyCount?: number
  /** 순금융재산(금융재산 − 금융채무). */
  finance?: number
}) {
  if (input.estate <= 0) return null
  const heirs: InheritanceHeirs =
    input.heirs ?? (input.spouse === false ? "children" : "spouse-children")
  const debts = Math.max(0, input.debts ?? 0)
  const net = Math.max(0, input.estate - debts)
  const children = heirs === "spouse-only" ? 0 : Math.max(0, Math.floor(input.children ?? 0))
  const childrenGiven = input.children !== undefined
  const hasNonSpouseHeir =
    heirs === "children" || (heirs === "spouse-children" && (!childrenGiven || children > 0))
  const minorCount = Math.max(0, Math.floor(input.minorCount ?? 0))
  const minorAge = Math.max(0, Math.floor(input.minorAge ?? 0))
  const minorYears = minorCount * Math.max(0, INHERITANCE.minorAgeCap - minorAge)
  const elderlyCount = Math.max(0, Math.floor(input.elderlyCount ?? 0))
  const childDeduction = children * INHERITANCE.child
  const minorDeduction = minorYears * INHERITANCE.minorPerYear
  const elderlyDeduction = elderlyCount * INHERITANCE.elderly
  const itemized =
    INHERITANCE.basic + childDeduction + minorDeduction + elderlyDeduction
  const usedLump = hasNonSpouseHeir && INHERITANCE.lump >= itemized
  const familyDeduction = usedLump ? INHERITANCE.lump : itemized
  const spouseDeduction = heirs === "children" ? 0 : INHERITANCE.spouseMin
  const financeDeduction = financeInheritanceDeduction(input.finance ?? 0)
  const deduction = familyDeduction + spouseDeduction + financeDeduction
  const taxable = Math.max(0, net - deduction)
  const { tax, rate } = progressiveTax(taxable, GIFT_BRACKETS)
  return {
    heirs,
    net,
    children,
    lump: usedLump ? INHERITANCE.lump : 0,
    basic: usedLump ? 0 : INHERITANCE.basic,
    childDeduction: usedLump ? 0 : childDeduction,
    minorDeduction: usedLump ? 0 : minorDeduction,
    elderlyDeduction: usedLump ? 0 : elderlyDeduction,
    itemized,
    usedLump,
    spouseDeduction,
    financeDeduction,
    deduction,
    taxable,
    tax,
    rate,
  }
}

export function calcLicenseTax(input: { value: number; kind: "inherit" | "gift" }) {
  if (input.value <= 0) return null
  const rate = input.kind === "inherit" ? LICENSE.inherit : LICENSE.gift
  const tax = truncWon(input.value * rate)
  const education = truncWon(tax * LICENSE.educationShare)
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
    allowOneHouseExempt: false,
  })
  return {
    giftAmount,
    debt,
    giftTax: gift?.tax ?? 0,
    gainsTax: gains?.total ?? 0,
    total: (gift?.tax ?? 0) + (gains?.total ?? 0),
  }
}
