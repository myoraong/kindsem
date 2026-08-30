import { INCOME_BRACKETS } from "./policy.generated.ts"

/**
 * 직장 4대보험·간이세액 근처 상수 (2026 고시).
 *
 * 국민연금: 보험료율 9.5%의 근로자 절반 4.75%. 기준소득월액 상·하한은
 * 2026.7.1.~2027.6.30. 보건복지부 고시(하한 41만, 상한 659만).
 * 건강보험: 직장 보험료율 7.19%의 근로자 절반 3.595%.
 * 장기요양: 건강보험료의 13.14%(소득 대비 0.9448%의 절반).
 * 고용보험 실업급여: 근로자 0.9%.
 * 건강보험 근로자 부담 상한: 4,591,740원.
 */
export const PAYROLL = {
  year: 2026,
  pensionEmployeeRate: 0.0475,
  pensionFloor: 410_000,
  pensionCeil: 6_590_000,
  healthEmployeeRate: 0.03595,
  longTermCareOfHealth: 0.1314,
  employmentEmployeeRate: 0.009,
  healthEmployeeCap: 4_591_740,
  healthFloor: 20_160,
  youthReliefRate: 0.9,
  youthReliefCap: 2_000_000,
  mealExemptMonthly: 200_000,
  basicPersonDeduction: 1_500_000,
  localIncomeRate: 0.1,
  bizWithholdingNational: 0.03,
  bizWithholdingLocal: 0.003,
  earnedDeductionCap: 20_000_000,
} as const

export const SIDE_JOB_PRESETS = {
  parttime: {
    id: "parttime" as const,
    label: "알바",
    expenseRate: 0.641,
    note: "인적용역(940909) 국세청 단순경비율 64.1%",
  },
  delivery: {
    id: "delivery" as const,
    label: "배달",
    expenseRate: 0.794,
    note: "퀵서비스(940918) 국세청 단순경비율 79.4%",
  },
  freelance: {
    id: "freelance" as const,
    label: "프리랜서",
    expenseRate: 0.641,
    note: "인적용역 국세청 단순경비율 64.1%",
  },
} as const

export type SideJobPresetId = keyof typeof SIDE_JOB_PRESETS

export function truncWon(value: number) {
  if (!Number.isFinite(value) || value === 0) return 0
  return value > 0 ? Math.floor(value) : Math.ceil(value)
}

export function progressiveIncomeTax(base: number) {
  if (base <= 0) return { tax: 0, rate: 0 }
  const row = INCOME_BRACKETS.find((item) => base <= item.upTo) ?? INCOME_BRACKETS[INCOME_BRACKETS.length - 1]
  return { tax: truncWon(Math.max(0, base * row.rate - row.deduction)), rate: row.rate }
}

/** 소득세법 제47조. 한도 2천만 원. */
export function earnedIncomeDeduction(gross: number) {
  if (gross <= 0) return 0
  let deduction = 0
  if (gross <= 5_000_000) deduction = gross * 0.7
  else if (gross <= 15_000_000) deduction = 3_500_000 + (gross - 5_000_000) * 0.4
  else if (gross <= 45_000_000) deduction = 7_500_000 + (gross - 15_000_000) * 0.15
  else if (gross <= 100_000_000) deduction = 12_000_000 + (gross - 45_000_000) * 0.05
  else deduction = 14_750_000 + (gross - 100_000_000) * 0.02
  return truncWon(Math.min(PAYROLL.earnedDeductionCap, Math.min(gross, deduction)))
}

/**
 * 소득세법 제59조. 산출세액의 55% 또는 71.5만+초과분의 30%,
 * 총급여 구간별 한도. 7천만 초과 한도 감소는 1/2×1/100(0.5%).
 */
export function earnedIncomeTaxCredit(calculatedTax: number, gross: number) {
  if (calculatedTax <= 0 || gross <= 0) return 0
  const raw =
    calculatedTax <= 1_300_000
      ? calculatedTax * 0.55
      : 715_000 + (calculatedTax - 1_300_000) * 0.3
  let cap = 740_000
  if (gross > 120_000_000) {
    cap = Math.max(200_000, 500_000 - (gross - 120_000_000) * 0.005)
  } else if (gross > 70_000_000) {
    cap = Math.max(500_000, 660_000 - (gross - 70_000_000) * 0.005)
  } else if (gross > 33_000_000) {
    cap = Math.max(660_000, 740_000 - (gross - 33_000_000) * 0.008)
  }
  return truncWon(Math.min(raw, cap))
}

export function pensionBaseMonthly(taxableMonthly: number) {
  if (taxableMonthly <= 0) return 0
  return Math.min(PAYROLL.pensionCeil, Math.max(PAYROLL.pensionFloor, taxableMonthly))
}

export function calcEmployeeInsurance(taxableMonthly: number) {
  const pensionCapped = taxableMonthly > PAYROLL.pensionCeil
  const pension = truncWon(pensionBaseMonthly(taxableMonthly) * PAYROLL.pensionEmployeeRate)
  let health = truncWon(taxableMonthly * PAYROLL.healthEmployeeRate)
  const healthCapped = health >= PAYROLL.healthEmployeeCap
  if (health > PAYROLL.healthEmployeeCap) health = PAYROLL.healthEmployeeCap
  const longTermCare = truncWon(health * PAYROLL.longTermCareOfHealth)
  const employment = truncWon(taxableMonthly * PAYROLL.employmentEmployeeRate)
  const monthly = pension + health + longTermCare + employment
  return {
    pension,
    health,
    longTermCare,
    employment,
    monthly,
    annual: monthly * 12,
    pensionCapped,
    healthCapped,
  }
}

export type QuitHealthKind = "voluntary" | "regional" | "dependent"

export function fullHealthPremium(taxableMonthly: number) {
  const cap = PAYROLL.healthEmployeeCap * 2
  let health = truncWon(Math.max(0, taxableMonthly) * PAYROLL.healthEmployeeRate * 2)
  const healthCapped = health >= cap
  if (health > cap) health = cap
  if (health > 0) health = Math.max(health, PAYROLL.healthFloor)
  const longTermCare = truncWon(health * PAYROLL.longTermCareOfHealth)
  return { health, longTermCare, monthly: health + longTermCare, healthCapped }
}

export function calcQuitHealth(input: {
  taxableMonthly: number
  workplaceHealth: number
  workplaceLtc: number
  kind: QuitHealthKind
  gapMonths: number
}) {
  const workplaceMonthly = Math.max(0, input.workplaceHealth) + Math.max(0, input.workplaceLtc)
  const full = fullHealthPremium(input.taxableMonthly)
  const kind = input.kind
  const quitMonthly =
    kind === "dependent" ? 0 : full.monthly
  const gapMonths = Math.max(0, Math.floor(input.gapMonths) || 0)
  const label =
    kind === "dependent"
      ? "피부양자"
      : kind === "voluntary"
        ? "임의계속가입"
        : "지역 · 소득월액×요율(재산 제외)"
  return {
    kind,
    label,
    workplaceMonthly,
    quitMonthly,
    extraMonthly: quitMonthly - workplaceMonthly,
    gapMonths,
    gapTotal: truncWon(quitMonthly * gapMonths),
    healthCapped: kind !== "dependent" && full.healthCapped,
  }
}

export type QuitHealthResult = ReturnType<typeof calcQuitHealth>

export type TakeHomeResult = {
  annualGross: number
  monthlyGross: number
  mealExemptAnnual: number
  taxableAnnual: number
  taxableMonthly: number
  insurance: ReturnType<typeof calcEmployeeInsurance>
  earnedDeduction: number
  earnedIncome: number
  personDeduction: number
  taxableBase: number
  calculatedTax: number
  taxRate: number
  earnedCredit: number
  incomeTax: number
  localTax: number
  youthRelief: number
  annualTax: number
  monthlyTax: number
  annualTakeHome: number
  monthlyTakeHome: number
}

export function calcTakeHome(input: {
  annualGross: number
  mealExempt?: boolean
  youthSme?: boolean
}) {
  const annualGross = Math.max(0, input.annualGross)
  const monthlyGross = truncWon(annualGross / 12)
  const mealExemptAnnual = input.mealExempt ? PAYROLL.mealExemptMonthly * 12 : 0
  const taxableAnnual = Math.max(0, annualGross - mealExemptAnnual)
  const taxableMonthly = truncWon(taxableAnnual / 12)
  const insurance = calcEmployeeInsurance(taxableMonthly)
  const earnedDeduction = earnedIncomeDeduction(taxableAnnual)
  const earnedIncome = Math.max(0, taxableAnnual - earnedDeduction)
  const personDeduction = Math.min(PAYROLL.basicPersonDeduction, earnedIncome)
  const taxableBase = Math.max(0, earnedIncome - personDeduction)
  const { tax: calculatedTax, rate: taxRate } = progressiveIncomeTax(taxableBase)
  const earnedCredit = earnedIncomeTaxCredit(calculatedTax, taxableAnnual)
  const afterCredit = Math.max(0, calculatedTax - earnedCredit)
  const youthRelief = input.youthSme
    ? Math.min(truncWon(afterCredit * PAYROLL.youthReliefRate), PAYROLL.youthReliefCap)
    : 0
  const incomeTax = Math.max(0, afterCredit - youthRelief)
  const localTax = truncWon(incomeTax * PAYROLL.localIncomeRate)
  const annualTax = incomeTax + localTax
  const monthlyTax = truncWon(annualTax / 12)
  const annualTakeHome = annualGross - insurance.annual - annualTax
  const monthlyTakeHome = monthlyGross - insurance.monthly - monthlyTax
  return {
    annualGross,
    monthlyGross,
    mealExemptAnnual,
    taxableAnnual,
    taxableMonthly,
    insurance,
    earnedDeduction,
    earnedIncome,
    personDeduction,
    taxableBase,
    calculatedTax,
    taxRate,
    earnedCredit,
    youthRelief,
    incomeTax,
    localTax,
    annualTax,
    monthlyTax,
    annualTakeHome,
    monthlyTakeHome,
  } satisfies TakeHomeResult
}

export function calcOfferCompare(input: {
  currentAnnual: number
  offerAnnual: number
  mealExempt?: boolean
  currentYouthSme?: boolean
  offerYouthSme?: boolean
  currentCommuteMonthly?: number
  offerCommuteMonthly?: number
  yearsOfService?: number
}) {
  const current = calcTakeHome({
    annualGross: input.currentAnnual,
    mealExempt: input.mealExempt,
    youthSme: input.currentYouthSme,
  })
  const offer = calcTakeHome({
    annualGross: input.offerAnnual,
    mealExempt: input.mealExempt,
    youthSme: input.offerYouthSme,
  })
  const currentCommute = Math.max(0, input.currentCommuteMonthly ?? 0)
  const offerCommute = Math.max(0, input.offerCommuteMonthly ?? 0)
  const annualDelta = offer.annualTakeHome - current.annualTakeHome
  const monthlyDelta = offer.monthlyTakeHome - current.monthlyTakeHome
  const commuteMonthlyDelta = offerCommute - currentCommute
  const monthlyDeltaAfterCommute = monthlyDelta - commuteMonthlyDelta
  const annualDeltaAfterCommute = annualDelta - commuteMonthlyDelta * 12
  const severance = truncWon(current.monthlyGross * Math.max(0, input.yearsOfService ?? 0))
  return {
    current,
    offer,
    annualDelta,
    monthlyDelta,
    currentCommute,
    offerCommute,
    monthlyDeltaAfterCommute,
    annualDeltaAfterCommute,
    severance,
  }
}

export type ExpenseMode = "rate" | "amount"

export function calcSideJobTax(input: {
  revenue: number
  expenseRate: number
  expenseAmount?: number
  expenseMode?: ExpenseMode
  basicDeduction?: number
}) {
  const revenue = Math.max(0, input.revenue)
  const expense =
    input.expenseMode === "amount"
      ? Math.max(0, input.expenseAmount ?? 0)
      : truncWon(revenue * Math.max(0, input.expenseRate))
  const incomeAmount = Math.max(0, revenue - expense)
  const basicDeduction = Math.max(0, input.basicDeduction ?? PAYROLL.basicPersonDeduction)
  const appliedBasic = Math.min(basicDeduction, incomeAmount)
  const taxableBase = Math.max(0, incomeAmount - appliedBasic)
  const { tax: incomeTax, rate } = progressiveIncomeTax(taxableBase)
  const localTax = truncWon(incomeTax * PAYROLL.localIncomeRate)
  const comprehensive = incomeTax + localTax
  const withheldNational = truncWon(revenue * PAYROLL.bizWithholdingNational)
  const withheldLocal = truncWon(withheldNational * PAYROLL.localIncomeRate)
  const withheld = withheldNational + withheldLocal
  const settlement = withheld - comprehensive
  return {
    revenue,
    expense,
    expenseRate: revenue > 0 ? expense / revenue : 0,
    incomeAmount,
    basicDeduction: appliedBasic,
    taxableBase,
    rate,
    incomeTax,
    localTax,
    comprehensive,
    withheldNational,
    withheldLocal,
    withheld,
    settlement,
    refund: Math.max(0, settlement),
    extraDue: Math.max(0, -settlement),
  }
}

export function calcBenefitNet(input: {
  monthlyAmount: number
  months: number
  taxable: boolean
}) {
  const monthlyAmount = Math.max(0, input.monthlyAmount)
  const months = Math.max(0, input.months)
  const taxMonthly = input.taxable ? truncWon(monthlyAmount * (PAYROLL.bizWithholdingNational + PAYROLL.bizWithholdingLocal)) : 0
  const netMonthly = monthlyAmount - taxMonthly
  return {
    monthlyAmount,
    months,
    taxable: input.taxable,
    taxMonthly,
    netMonthly,
    netTotal: truncWon(netMonthly * months),
    taxTotal: truncWon(taxMonthly * months),
  }
}

export function calcCertPayback(input: {
  cost: number
  currentAnnual: number
  raiseAnnual: number
  mealExempt?: boolean
}) {
  const cost = Math.max(0, input.cost)
  const current = calcTakeHome({
    annualGross: input.currentAnnual,
    mealExempt: input.mealExempt,
  })
  const after = calcTakeHome({
    annualGross: input.currentAnnual + Math.max(0, input.raiseAnnual),
    mealExempt: input.mealExempt,
  })
  const annualNetRaise = after.annualTakeHome - current.annualTakeHome
  const monthlyNetRaise = after.monthlyTakeHome - current.monthlyTakeHome
  const months = annualNetRaise > 0 ? cost / (annualNetRaise / 12) : null
  return {
    cost,
    current,
    after,
    annualNetRaise,
    monthlyNetRaise,
    months,
  }
}
