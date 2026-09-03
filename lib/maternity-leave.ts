import { MATERNITY_LEAVE } from "./policy.generated.ts"

export type MaternityKind = "standard" | "preterm" | "multiple"

function employerDays(kind: MaternityKind) {
  return kind === "multiple"
    ? MATERNITY_LEAVE.employerPaidDays.multiple
    : MATERNITY_LEAVE.employerPaidDays.standard
}

function eiDays(kind: MaternityKind, priorityFirm: boolean) {
  const period = MATERNITY_LEAVE.days[kind]
  if (priorityFirm) return period
  const extra = Math.max(0, period - employerDays(kind))
  return Math.min(extra, MATERNITY_LEAVE.eiExtraCapDays[kind])
}

/**
 * 고용보험법 제76조 · 근로기준법 제74조 · 출산전후휴가 급여등 상한액 고시.
 * 통상임금은 휴가 시작일 기준, 고시 상한은 일수로 나눕니다. 월액÷30일이 고시 90일·660만과 맞습니다.
 */
export function calcMaternityLeave(input: {
  monthlyOrdinary: number
  kind: MaternityKind
  priorityFirm: boolean
}) {
  if (input.monthlyOrdinary <= 0) return null
  const periodDays = MATERNITY_LEAVE.days[input.kind]
  const cap = MATERNITY_LEAVE.cap[input.kind]
  const capDays = MATERNITY_LEAVE.capDays[input.kind]
  const paidByEmployer = employerDays(input.kind)
  const paidByEi = eiDays(input.kind, input.priorityFirm)
  const dailyOrdinary = input.monthlyOrdinary / 30
  const dailyCap = cap / capDays
  const eiPay = Math.round(Math.min(dailyOrdinary, dailyCap) * paidByEi)
  const eiOnEmployerDays = input.priorityFirm
    ? Math.round(Math.min(dailyOrdinary, dailyCap) * paidByEmployer)
    : 0
  const employerPay = Math.round(Math.max(0, dailyOrdinary * paidByEmployer - eiOnEmployerDays))
  return {
    kind: input.kind,
    priorityFirm: input.priorityFirm,
    periodDays,
    employerDays: paidByEmployer,
    eiDays: paidByEi,
    dailyOrdinary,
    cap,
    eiPay,
    employerPay,
    total: eiPay + employerPay,
  }
}
