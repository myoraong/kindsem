export type TaxBracket = {
  upTo: number
  rate: number
  deduction: number
}

export function progressiveTax(base: number, brackets: readonly TaxBracket[]) {
  if (base <= 0) return { tax: 0, rate: 0 }
  const row = brackets.find((item) => base <= item.upTo) ?? brackets[brackets.length - 1]
  return { tax: Math.max(0, base * row.rate - row.deduction), rate: row.rate }
}

export {
  CORP_BRACKETS,
  GIFT_BRACKETS,
  GIFT_DEDUCTIONS,
  INCOME_BRACKETS,
} from "@/lib/policy.generated"
