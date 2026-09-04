"use client"

import { useMemo, useState } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { calcLoanInterest, type Repayment } from "@/lib/loan"
import { formatWon, kakaoCopyLine, manwonToWon } from "@/lib/format"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "원리금균등과 원금균등은 뭐가 다른가요?",
    a: "원리금균등은 매달 내는 금액이 같고, 이자는 남은 원금에 월리(연이율÷12)를 곱합니다. 원금균등은 원금을 개월 수로 나눈 뒤 이자를 더해, 첫 달이 가장 큽니다. 만기일시는 기간 동안 이자만 내고 만기에 원금을 갚습니다.",
  },
  {
    q: "중도상환·수수료는요?",
    a: "넣지 않습니다. 가산금리, 원금 거치 후 분할, 일수 일할 이자는 약정마다 달라 식에 없습니다.",
  },
]

export function LoanInterestCalc({ item }: { item: CalcItem }) {
  const [principal, setPrincipal] = useState("5000")
  const [rate, setRate] = useState("5.5")
  const [months, setMonths] = useState("36")
  const [method, setMethod] = useState<Repayment>("equal-payment")

  const result = useMemo(() => {
    return calcLoanInterest({
      principal: manwonToWon(Number(principal) || 0),
      annualPercent: Number(rate) || 0,
      months: Math.round(Number(months) || 0),
      method,
    })
  }, [principal, rate, months, method])

  const title =
    method === "equal-principal" ? "첫 달 납입" : method === "interest-only" ? "매달 이자" : "월 납입"

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title={title}
          amount={result?.monthly ?? null}
          copyLine={
            result
              ? kakaoCopyLine(title, formatWon(result.monthly), `이자 합계 ${formatWon(result.totalInterest)}`)
              : undefined
          }
          rows={
            result
              ? method === "equal-principal"
                ? [
                    { label: "첫 달", value: formatWon(result.first) },
                    { label: "마지막 달", value: formatWon(result.last) },
                    { label: "총 이자", value: formatWon(result.totalInterest) },
                    { label: "총 상환", value: formatWon(result.totalPay) },
                  ]
                : [
                    { label: method === "interest-only" ? "매달 이자" : "매달 같은 금액", value: formatWon(result.monthly) },
                    { label: "총 이자", value: formatWon(result.totalInterest) },
                    { label: "총 상환", value: formatWon(result.totalPay) },
                  ]
              : []
          }
          empty="대출 금액, 금리, 기간만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <MoneyField id="p" label="대출 금액" value={principal} onChange={setPrincipal} />
        <AmountChips
          options={[
            { label: "1천만", value: "1000" },
            { label: "3천만", value: "3000" },
            { label: "5천만", value: "5000" },
            { label: "1억", value: "10000" },
          ]}
          onPick={setPrincipal}
        />
        <MoneyField id="r" label="연 금리" unit="%" value={rate} onChange={setRate} />
        <MoneyField id="m" label="기간" unit="개월" value={months} onChange={setMonths} />
        <AmountChips
          options={[
            { label: "12개월", value: "12" },
            { label: "24개월", value: "24" },
            { label: "36개월", value: "36" },
            { label: "60개월", value: "60" },
          ]}
          onPick={setMonths}
        />
        <ChoiceGroup
          label="상환 방식"
          value={method}
          onChange={setMethod}
          options={[
            { value: "equal-payment", label: "원리금균등" },
            { value: "equal-principal", label: "원금균등" },
            { value: "interest-only", label: "만기일시" },
          ]}
        />
        <Hint>
          월리는 연 금리÷12 입니다. 주택담보·전세자금은 각 계산기에서 한도와 이자만 상환을 따로 봅니다.
          중도상환 수수료는 포함하지 않습니다.
        </Hint>
      </div>
    </CalcShell>
  )
}
