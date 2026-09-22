import { encodeCalcQuery, type CalcPersistValue } from "./calc-persist.ts"

type Bag = Record<string, CalcPersistValue>

/**
 * 옆 계산기로 넘어갈 때 같은 칸만 주소에 실어 보냅니다.
 * 받는 쪽은 이 칸만 덮고, 나머지 저장값은 그대로 둡니다.
 */
export function carryQuery(from: string, to: string, values: Partial<Bag> | null | undefined): string {
  if (!values || from === to) return ""
  const picked = pickCarry(from, to, values)
  if (Object.keys(picked).length === 0) return ""
  return encodeCalcQuery(picked)
}

function pickCarry(from: string, to: string, values: Partial<Bag>): Bag {
  const pay = payPair(from, to)
  if (pay) return pickPay(to, values)
  const wage = wagePair(from, to)
  if (wage) return pickWage(from, to, values)
  const house = housePair(from, to)
  if (house) return pickKeys(values, ["price", "homes", "adjusted", "over85", "first", "shrinking"])
  const rent = rentPair(from, to)
  if (rent) return pickKeys(values, ["jeonse", "deposit", "monthly", "base"])
  const leave = leavePair(from, to)
  if (leave) return pickKeys(values, ["monthly"])
  const loan = loanPair(from, to)
  if (loan) return pickLoan(from, to, values)
  const prorate = proratePair(from, to)
  if (prorate) return pickProrate(from, values)
  return {}
}

function payPair(from: string, to: string) {
  return (
    (from === "take-home" && to === "offer-compare") ||
    (from === "offer-compare" && to === "take-home")
  )
}

function pickPay(to: string, values: Partial<Bag>): Bag {
  const out = pickKeys(values, [
    "period",
    "current",
    "mealExempt",
    "dependents",
    "taxMode",
    "children",
    "withholdRate",
  ])
  const youth = values.youth
  if (to === "take-home") {
    out.youth = youth === "current" || youth === "both" ? "current" : "none"
  } else if (youth === "none" || youth === "current") {
    out.youth = youth
  }
  return out
}

const WAGE = new Set(["weekly-holiday", "part-time-month", "min-wage", "overtime-pay"])

function wagePair(from: string, to: string) {
  return WAGE.has(from) && WAGE.has(to)
}

function pickWage(from: string, to: string, values: Partial<Bag>): Bag {
  const out: Bag = {}
  if (typeof values.weeklyHours === "string") out.weeklyHours = values.weeklyHours
  if (
    typeof values.attended === "boolean" &&
    (to === "weekly-holiday" || to === "part-time-month") &&
    from !== "min-wage" &&
    from !== "overtime-pay"
  ) {
    out.attended = values.attended
  }

  const monthly = from === "min-wage" ? values.monthlyMan : values.ordinaryMan
  const hourlyMode = from === "part-time-month" || values.pay === "hourly" || values.pay == null
  if (hourlyMode && typeof values.hourly === "string") {
    out.hourly = values.hourly
    if (to !== "part-time-month") out.pay = "hourly"
    return out
  }
  if (!hourlyMode && typeof monthly === "string") {
    if (to === "part-time-month") return out
    out.pay = "monthly"
    if (to === "min-wage") out.monthlyMan = monthly
    else out.ordinaryMan = monthly
  }
  return out
}

function housePair(from: string, to: string) {
  return (
    (from === "acquisition" && to === "closing-cost") ||
    (from === "closing-cost" && to === "acquisition")
  )
}

function rentPair(from: string, to: string) {
  return (
    (from === "rent-convert" && to === "jeonse-vs-rent") ||
    (from === "jeonse-vs-rent" && to === "rent-convert")
  )
}

function leavePair(from: string, to: string) {
  return (
    (from === "parental-leave" && to === "maternity-leave") ||
    (from === "maternity-leave" && to === "parental-leave")
  )
}

const LOAN = new Set(["mortgage", "loan-interest", "jeonse"])

function loanPair(from: string, to: string) {
  return LOAN.has(from) && LOAN.has(to)
}

function pickLoan(from: string, to: string, values: Partial<Bag>): Bag {
  const out = pickKeys(values, ["principal", "rate"])
  const shareYears =
    (from === "mortgage" || from === "jeonse") && (to === "mortgage" || to === "jeonse")
  if (shareYears && typeof values.years === "string") out.years = values.years
  const method = values.method
  const shareMethod =
    (from === "mortgage" || from === "loan-interest") &&
    (to === "mortgage" || to === "loan-interest") &&
    (method === "equal-payment" || method === "equal-principal")
  if (shareMethod) out.method = method
  return out
}

function proratePair(from: string, to: string) {
  return (from === "take-home" && to === "prorate-pay") || (from === "prorate-pay" && to === "take-home")
}

function pickProrate(from: string, values: Partial<Bag>): Bag {
  if (from === "prorate-pay") {
    const out: Bag = { period: "month" }
    if (typeof values.pay === "string") out.current = values.pay
    return out
  }
  if (values.period !== "month") return {}
  const out: Bag = {}
  if (typeof values.current === "string") out.pay = values.current
  return out
}

function pickKeys(values: Partial<Bag>, keys: string[]): Bag {
  const out: Bag = {}
  for (const key of keys) {
    const value = values[key]
    if (typeof value === "string" || typeof value === "boolean") out[key] = value
  }
  return out
}
