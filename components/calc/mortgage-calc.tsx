"use client"

import { useMemo, useState } from "react"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { equalPayment, equalPrincipal, type Repayment } from "@/lib/loan"
import { formatWon, manwonToWon } from "@/lib/format"
import type { CalcItem } from "@/lib/catalog"

export function MortgageCalc({ item }: { item: CalcItem }) {
  const [principal, setPrincipal] = useState("30000")
  const [rate, setRate] = useState("3.8")
  const [years, setYears] = useState("30")
  const [method, setMethod] = useState<Repayment>("equal-payment")

  const result = useMemo(() => {
    const p = manwonToWon(Number(principal) || 0)
    const r = Number(rate)
    const months = Math.round(Number(years) * 12)
    if (!p || !months) return null
    if (method === "equal-principal") {
      const calc = equalPrincipal(p, r, months)
      return {
        amount: calc.first,
        rows: [
          { label: "첫 달", value: formatWon(calc.first) },
          { label: "마지막 달", value: formatWon(calc.last) },
          { label: "총 이자", value: formatWon(calc.totalInterest) },
          { label: "총 상환", value: formatWon(calc.totalPay) },
        ],
      }
    }
    const calc = equalPayment(p, r, months)
    return {
      amount: calc.monthly,
      rows: [
        { label: "매달 같은 금액", value: formatWon(calc.monthly) },
        { label: "총 이자", value: formatWon(calc.totalInterest) },
        { label: "총 상환", value: formatWon(calc.totalPay) },
      ],
    }
  }, [principal, rate, years, method])

  return (
    <CalcShell
      item={item}
      result={
        <ResultReceipt
          title={method === "equal-principal" ? "첫 달 납입" : "월 납입"}
          amount={result?.amount ?? null}
          rows={result?.rows ?? []}
          empty="대출 금액, 금리, 기간만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <MoneyField id="p" label="대출 금액" value={principal} onChange={setPrincipal} />
        <MoneyField id="r" label="연 금리" unit="%" value={rate} onChange={setRate} />
        <MoneyField id="y" label="기간" unit="년" value={years} onChange={setYears} />
        <ChoiceGroup
          label="상환 방식"
          value={method}
          onChange={setMethod}
          options={[
            { value: "equal-payment", label: "원리금균등" },
            { value: "equal-principal", label: "원금균등" },
          ]}
        />
        <p className="text-sm leading-6 text-muted-foreground">
          원리금균등은 매달 금액이 같고, 원금균등은 갈수록 줄어듭니다. 중도상환 수수료는 포함하지
          않습니다.
        </p>
      </div>
    </CalcShell>
  )
}
