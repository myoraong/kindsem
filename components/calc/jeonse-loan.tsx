"use client"

import { useMemo, useState } from "react"
import { CalcShell } from "@/components/calc/calc-shell"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { interestOnly } from "@/lib/loan"
import { formatWon, manwonToWon } from "@/lib/format"
import type { CalcItem } from "@/lib/catalog"

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
        <MoneyField id="r" label="연 금리" unit="%" value={rate} onChange={setRate} />
        <MoneyField id="y" label="기간" unit="년" value={years} onChange={setYears} />
        <p className="text-sm leading-6 text-muted-foreground">
          만기일시상환(이자만) 기준입니다. 실제 금리는 은행·보증기관 조건에 따라 달라집니다.
        </p>
      </div>
    </CalcShell>
  )
}
