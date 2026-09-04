"use client"

import { useMemo, useState } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { interestOnly } from "@/lib/loan"
import { formatWon, manwonToWon } from "@/lib/format"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "왜 이자만 나오나요?",
    a: "전세자금대출은 보통 만기까지 이자만 내고, 만기에 원금을 갚거나 연장합니다. 원리금균등은 대출 이자 계산기를 보세요.",
  },
  {
    q: "보증료·중도상환은요?",
    a: "주택금융공사·서울보증 보증료와 중도상환 수수료는 상품·보증비율마다 달라 넣지 않았습니다. 적어 주신 금리로 이자만 셉니다.",
  },
]

export function JeonseLoan({ item }: { item: CalcItem }) {
  const [principal, setPrincipal] = useState("15000")
  const [rate, setRate] = useState("3.5")
  const [years, setYears] = useState("2")

  const result = useMemo(() => {
    const p = manwonToWon(Number(principal) || 0)
    const r = Number(rate)
    const months = Math.round(Number(years) * 12)
    if (!p || !months) return null
    return interestOnly(p, r, months)
  }, [principal, rate, years])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="매달 이자"
          amount={result?.monthly ?? null}
          rows={
            result
              ? [
                  { label: "대출원금", value: formatWon(manwonToWon(Number(principal) || 0)) },
                  { label: "기간", value: `${years}년` },
                  { label: "총 이자", value: formatWon(result.totalInterest) },
                  { label: "만기 때 갚을 돈", value: formatWon(result.totalPay) },
                ]
              : []
          }
          empty="전세자금은 보통 이자만 냅니다. 원금과 금리만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-4">
        <MoneyField id="p" label="대출 금액" value={principal} onChange={setPrincipal} />
        <AmountChips
          options={[
            { label: "1억", value: "10000" },
            { label: "1.5억", value: "15000" },
            { label: "2억", value: "20000" },
            { label: "3억", value: "30000" },
          ]}
          onPick={setPrincipal}
        />
        <MoneyField id="r" label="연 금리" unit="%" value={rate} onChange={setRate} />
        <div className="space-y-2">
          <MoneyField id="y" label="기간" unit="년" value={years} onChange={setYears} />
          <AmountChips
            options={[
              { label: "1년", value: "1" },
              { label: "2년", value: "2" },
              { label: "3년", value: "3" },
              { label: "4년", value: "4" },
            ]}
            onPick={setYears}
          />
        </div>
        <Hint>
          만기일시상환(이자만) 기준입니다. 실제 금리는 은행·보증기관 조건에 따라 달라집니다.
        </Hint>
      </div>
    </CalcShell>
  )
}
