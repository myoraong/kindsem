"use client"

import { useMemo, useState } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { equalPayment, equalPrincipal, type Repayment } from "@/lib/loan"
import { formatWon, manwonToWon } from "@/lib/format"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "원리금균등과 원금균등은 뭐가 다른가요?",
    a: "원리금균등은 매달 내는 금액이 같고, 이자는 남은 원금에 월리(연이율÷12)를 곱합니다. 원금균등은 원금을 개월 수로 나눈 뒤 이자를 더해, 첫 달이 가장 큽니다.",
  },
  {
    q: "중도상환·수수료는요?",
    a: "넣지 않습니다. 거치 후 분할, 가산금리, 중도상환 수수료는 약정마다 달라 식에 없습니다. 전세자금은 전세대출 이자에서 이자만 상환을 봅니다.",
  },
]

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
      faq={<FaqList items={FAQ} />}
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
        <AmountChips
          options={[
            { label: "2억", value: "20000" },
            { label: "3억", value: "30000" },
            { label: "5억", value: "50000" },
            { label: "8억", value: "80000" },
          ]}
          onPick={setPrincipal}
        />
        <MoneyField id="r" label="연 금리" unit="%" value={rate} onChange={setRate} />
        <MoneyField id="y" label="기간" unit="년" value={years} onChange={setYears} />
        <AmountChips
          options={[
            { label: "10년", value: "10" },
            { label: "20년", value: "20" },
            { label: "30년", value: "30" },
            { label: "40년", value: "40" },
          ]}
          onPick={setYears}
        />
        <ChoiceGroup
          label="상환 방식"
          value={method}
          onChange={setMethod}
          options={[
            { value: "equal-payment", label: "원리금균등" },
            { value: "equal-principal", label: "원금균등" },
          ]}
        />
        <Hint>
          원리금균등은 매달 금액이 같고, 원금균등은 갈수록 줄어듭니다. 중도상환 수수료는 포함하지
          않습니다.
        </Hint>
      </div>
    </CalcShell>
  )
}
