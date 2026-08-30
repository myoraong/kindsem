import assert from "node:assert/strict"
import test from "node:test"
import {
  PAYROLL,
  calcBenefitNet,
  calcCertPayback,
  calcEmployeeInsurance,
  calcOfferCompare,
  calcQuitHealth,
  calcSideJobTax,
  calcTakeHome,
  earnedIncomeDeduction,
  earnedIncomeTaxCredit,
  fullHealthPremium,
  pensionBaseMonthly,
} from "./payroll.ts"

test("국민연금 기준소득월액은 2026.7 상한 659만", () => {
  assert.equal(pensionBaseMonthly(0), 0)
  assert.equal(pensionBaseMonthly(300_000), PAYROLL.pensionFloor)
  assert.equal(pensionBaseMonthly(4_000_000), 4_000_000)
  assert.equal(pensionBaseMonthly(10_000_000), PAYROLL.pensionCeil)
})

test("근로소득공제 구간과 2천만 한도", () => {
  assert.equal(earnedIncomeDeduction(4_000_000), 2_800_000)
  assert.equal(earnedIncomeDeduction(10_000_000), 5_500_000)
  assert.equal(earnedIncomeDeduction(40_000_000), 11_250_000)
  assert.equal(earnedIncomeDeduction(50_000_000), 12_250_000)
  assert.ok(earnedIncomeDeduction(1_000_000_000) <= PAYROLL.earnedDeductionCap)
})

test("근로소득세액공제 한도는 총급여에 따라 줄어든다", () => {
  assert.equal(earnedIncomeTaxCredit(1_000_000, 30_000_000), 550_000)
  assert.equal(earnedIncomeTaxCredit(4_000_000, 50_000_000), 660_000)
  assert.equal(earnedIncomeTaxCredit(8_000_000, 80_000_000), 610_000)
  assert.equal(earnedIncomeTaxCredit(12_000_000, 150_000_000), 350_000)
})

test("실수령은 4대보험·소득세·지방세를 빼고 월·연이 맞는다", () => {
  const result = calcTakeHome({ annualGross: 40_000_000 })
  const insurance = calcEmployeeInsurance(result.taxableMonthly)
  assert.equal(result.insurance.monthly, insurance.monthly)
  assert.equal(
    result.monthlyTakeHome,
    result.monthlyGross - result.insurance.monthly - result.monthlyTax,
  )
  assert.equal(result.annualTax, result.incomeTax + result.localTax)
  assert.equal(result.localTax, Math.floor(result.incomeTax * 0.1))
  assert.ok(result.monthlyTakeHome > 2_700_000)
  assert.ok(result.monthlyTakeHome < 3_000_000)
  assert.ok(result.insurance.pension > 0)
  assert.ok(result.earnedDeduction > 0)
  assert.ok(result.personDeduction === 1_500_000)
})

test("식대 비과세는 과세급여와 보험료를 줄인다", () => {
  const plain = calcTakeHome({ annualGross: 40_000_000, mealExempt: false })
  const meal = calcTakeHome({ annualGross: 40_000_000, mealExempt: true })
  assert.equal(meal.mealExemptAnnual, 2_400_000)
  assert.equal(meal.taxableAnnual, 37_600_000)
  assert.ok(meal.insurance.monthly < plain.insurance.monthly)
  assert.ok(meal.monthlyTakeHome > plain.monthlyTakeHome)
})

test("청년감면은 소득세 90%에 연 200만 한도", () => {
  const plain = calcTakeHome({ annualGross: 50_000_000 })
  const youth = calcTakeHome({ annualGross: 50_000_000, youthSme: true })
  assert.ok(youth.youthRelief > 0)
  assert.ok(youth.youthRelief <= 2_000_000)
  assert.ok(youth.incomeTax < plain.incomeTax)
  assert.ok(youth.annualTakeHome > plain.annualTakeHome)
})

test("고소득 국민연금은 상한만 적용", () => {
  const result = calcTakeHome({ annualGross: 180_000_000 })
  assert.equal(result.insurance.pension, Math.floor(PAYROLL.pensionCeil * PAYROLL.pensionEmployeeRate))
})

test("이직 제안 세후 차이와 교통비·퇴직금", () => {
  const result = calcOfferCompare({
    currentAnnual: 40_000_000,
    offerAnnual: 48_000_000,
    currentCommuteMonthly: 100_000,
    offerCommuteMonthly: 200_000,
    yearsOfService: 3,
  })
  assert.ok(result.annualDelta > 0)
  assert.equal(result.monthlyDeltaAfterCommute, result.monthlyDelta - 100_000)
  assert.equal(result.severance, result.current.monthlyGross * 3)
})

test("알바 3.3% vs 종소세 공제 줄과 환급", () => {
  const result = calcSideJobTax({
    revenue: 20_000_000,
    expenseRate: 0.641,
  })
  assert.equal(result.expense, 12_820_000)
  assert.equal(result.incomeAmount, 7_180_000)
  assert.equal(result.basicDeduction, 1_500_000)
  assert.equal(result.taxableBase, 5_680_000)
  assert.equal(result.rate, 0.06)
  assert.equal(result.incomeTax, 340_800)
  assert.equal(result.localTax, 34_080)
  assert.equal(result.comprehensive, 374_880)
  assert.equal(result.withheldNational, 600_000)
  assert.equal(result.withheldLocal, 60_000)
  assert.equal(result.withheld, 660_000)
  assert.equal(result.settlement, 285_120)
  assert.equal(result.refund, 285_120)
  assert.equal(result.extraDue, 0)
})

test("경비 금액 모드와 추가납부", () => {
  const result = calcSideJobTax({
    revenue: 50_000_000,
    expenseRate: 0.1,
    expenseAmount: 5_000_000,
    expenseMode: "amount",
    basicDeduction: 1_500_000,
  })
  assert.equal(result.expense, 5_000_000)
  assert.equal(result.incomeAmount, 45_000_000)
  assert.ok(result.extraDue > 0)
  assert.equal(result.refund, 0)
})

test("실업급여는 비과세, 과세 여부를 모르면 3.3%를 빼지 않는다", () => {
  const jobless = calcBenefitNet({ monthlyAmount: 1_500_000, months: 4, taxable: false })
  assert.equal(jobless.netMonthly, 1_500_000)
  assert.equal(jobless.netTotal, 6_000_000)
  assert.equal(jobless.taxMonthly, 0)
  const unknown = calcBenefitNet({ monthlyAmount: 1_000_000, months: 3, taxable: false })
  assert.equal(unknown.taxMonthly, 0)
  assert.equal(unknown.netMonthly, 1_000_000)
  assert.equal(unknown.netTotal, 3_000_000)
})

test("사업소득 원천 3.3% 산식은 명시할 때만 적용", () => {
  const taxed = calcBenefitNet({ monthlyAmount: 1_000_000, months: 3, taxable: true })
  assert.equal(taxed.taxMonthly, 33_000)
  assert.equal(taxed.netMonthly, 967_000)
})

test("자격 회수 기간은 세후 연봉 상승으로 나눈다", () => {
  const result = calcCertPayback({
    cost: 800_000,
    currentAnnual: 40_000_000,
    raiseAnnual: 2_000_000,
  })
  assert.ok(result.annualNetRaise > 0)
  assert.ok(result.annualNetRaise < 2_000_000)
  assert.ok(result.months !== null && result.months > 0)
  assert.ok(result.months !== null && result.months < 12)
  const none = calcCertPayback({ cost: 800_000, currentAnnual: 40_000_000, raiseAnnual: 0 })
  assert.equal(none.months, null)
})

test("퇴사 후 건보는 임의계속이 직장 본인보다 크고, 피부양자는 0", () => {
  const job = calcTakeHome({ annualGross: 36_000_000, mealExempt: false })
  const workplace = job.insurance.health + job.insurance.longTermCare
  const full = fullHealthPremium(job.taxableMonthly)
  const voluntary = calcQuitHealth({
    taxableMonthly: job.taxableMonthly,
    workplaceHealth: job.insurance.health,
    workplaceLtc: job.insurance.longTermCare,
    kind: "voluntary",
    gapMonths: 2,
  })
  assert.equal(voluntary.quitMonthly, full.monthly)
  assert.ok(voluntary.quitMonthly > workplace)
  assert.equal(voluntary.gapTotal, voluntary.quitMonthly * 2)
  const dependent = calcQuitHealth({
    taxableMonthly: job.taxableMonthly,
    workplaceHealth: job.insurance.health,
    workplaceLtc: job.insurance.longTermCare,
    kind: "dependent",
    gapMonths: 2,
  })
  assert.equal(dependent.quitMonthly, 0)
  assert.equal(dependent.gapTotal, 0)
  const regional = calcQuitHealth({
    taxableMonthly: job.taxableMonthly,
    workplaceHealth: job.insurance.health,
    workplaceLtc: job.insurance.longTermCare,
    kind: "regional",
    gapMonths: 2,
  })
  assert.equal(regional.label, "지역 · 소득월액×요율(재산 제외)")
  assert.equal(regional.quitMonthly, full.monthly)
})
