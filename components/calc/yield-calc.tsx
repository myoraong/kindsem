"use client"

import { useMemo, useState } from "react"
import { CalcShell } from "@/components/calc/calc-shell"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatPercent, formatWon, manwonToWon } from "@/lib/format"
import type { CalcItem } from "@/lib/catalog"

export function YieldCalc({ item }: { item: CalcItem }) {
  const [price, setPrice] = useState("45000")
  const [deposit, setDeposit] = useState("5000")
  const [monthly, setMonthly] = useState("90")

  const result = useMemo(() => {
    const p = manwonToWon(Number(price) || 0)
    const d = manwonToWon(Number(deposit) || 0)
    const m = manwonToWon(Number(monthly) || 0)
    if (!p || !m) return null
    const invested = Math.max(p - d, 0)
    const yearly = m * 12
    const surface = (yearly / p) * 100
    const real = invested > 0 ? (yearly / invested) * 100 : 0
    return { invested, yearly, surface, real }
  }, [price, deposit, monthly])

  return (
    <CalcShell
      item={item}
      result={
        <ResultReceipt
          title="실질 연 수익률"
          amount={result ? result.real : null}
          kind="percent"
          caption={result ? `표면 ${formatPercent(result.surface)}` : undefined}
          rows={
            result
              ? [
                  { label: "연 임대수입", value: formatWon(result.yearly) },
                  { label: "실제 투입금 (매매가-보증금)", value: formatWon(result.invested) },
                  { label: "표면 수익률", value: formatPercent(result.surface) },
                  { label: "실질 수익률", value: formatPercent(result.real) },
                ]
              : []
          }
          empty="매매가와 월세만 넣으면 수익률이 바로 나옵니다."
        />
      }
    >
      <div className="space-y-4">
        <MoneyField id="price" label="매매가" value={price} onChange={setPrice} />
        <MoneyField id="deposit" label="보증금" value={deposit} onChange={setDeposit} />
        <MoneyField id="monthly" label="월세" value={monthly} onChange={setMonthly} />
        <p className="text-sm leading-6 text-muted-foreground">
          관리비·공실·세금은 빼지 않은 단순 수익률입니다. 집을 비교할 때 첫 숫자로 쓰기 좋습니다.
        </p>
      </div>
    </CalcShell>
  )
}
