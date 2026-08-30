import { calcBrokerage } from "./brokerage.ts"
import {
  equalPayment,
  equalPaymentFirstYearInterest,
  interestOnly,
} from "./loan.ts"

export type MovingDeal = "jeonse" | "wolse"
export type MovingLoanMethod = "equal-payment" | "interest-only"

export function calcMovingTotal(input: {
  deal: MovingDeal
  depositWon: number
  monthlyRentWon: number
  moveWon: number
  stuffWon: number
  insuranceWon: number
  loanWon: number
  annualRatePercent: number
  years: number
  loanMethod: MovingLoanMethod
}) {
  const deposit = Math.max(0, input.depositWon)
  const monthlyRent = input.deal === "wolse" ? Math.max(0, input.monthlyRentWon) : 0
  const move = Math.max(0, input.moveWon)
  const stuff = Math.max(0, input.stuffWon)
  const insurance = Math.max(0, input.insuranceWon)
  const loan = Math.max(0, input.loanWon)

  if (!deposit && !monthlyRent && !move && !stuff && !insurance) {
    return null
  }

  const brokerage = calcBrokerage({
    deal: input.deal,
    property: "house",
    price: deposit,
    monthlyRent,
    includeVat: true,
  })

  const grossCash = deposit + monthlyRent + brokerage.total + move + stuff + insurance
  const cashOnDay = Math.max(0, grossCash - loan)
  const loanSurplus = Math.max(0, loan - grossCash)
  const hasLoan = loan > 0
  const months = Math.round(input.years * 12)
  const loanReady = hasLoan && months > 0

  let monthlyPay = 0
  let annualInterest = 0
  let totalInterest = 0
  let monthlyLabel: "월 원리금" | "월 이자" | null = null

  if (loanReady) {
    if (input.loanMethod === "equal-payment") {
      const calc = equalPayment(loan, input.annualRatePercent, months)
      monthlyPay = calc.monthly
      totalInterest = calc.totalInterest
      annualInterest = equalPaymentFirstYearInterest(loan, input.annualRatePercent, months)
      monthlyLabel = "월 원리금"
    } else {
      const calc = interestOnly(loan, input.annualRatePercent, months)
      monthlyPay = calc.monthly
      totalInterest = calc.totalInterest
      annualInterest = interestOnly(
        loan,
        input.annualRatePercent,
        Math.min(12, months),
      ).totalInterest
      monthlyLabel = "월 이자"
    }
  }

  return {
    deposit,
    monthlyRent,
    brokerage,
    move,
    stuff,
    insurance,
    loan,
    grossCash,
    cashOnDay,
    loanSurplus,
    hasLoan,
    loanReady,
    months,
    monthlyPay,
    annualInterest,
    totalInterest,
    monthlyLabel,
  }
}
