"use client"

import { useMemo, useState } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatPercent, formatWon, manwonToWon } from "@/lib/format"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "표면과 실질이 다른가요?",
    a: "표면은 연 월세합 ÷ 매매가입니다. 실질은 연 월세합 ÷ (매매가 − 보증금)입니다. 세입자가 맡긴 보증금만큼 실제 투입금이 줄어듭니다.",
  },
  {
    q: "세금·공실은요?",
    a: "넣지 않습니다. 재산세·소득세·관리비·공실을 빼기 전의 단순 수익률입니다. 집을 비교할 때 첫 숫자로 쓰기 좋습니다.",
  },
]

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
      faq={<FaqList items={FAQ} />}
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
        <AmountChips
          options={[
            { label: "3억", value: "30000" },
            { label: "4.5억", value: "45000" },
            { label: "6억", value: "60000" },
            { label: "9억", value: "90000" },
          ]}
          onPick={setPrice}
        />
        <div className="space-y-2">
          <MoneyField id="deposit" label="보증금" value={deposit} onChange={setDeposit} />
          <AmountChips
            options={[
              { label: "1천", value: "1000" },
              { label: "3천", value: "3000" },
              { label: "5천", value: "5000" },
              { label: "1억", value: "10000" },
            ]}
            onPick={setDeposit}
          />
        </div>
        <div className="space-y-2">
          <MoneyField id="monthly" label="월세" value={monthly} onChange={setMonthly} />
          <AmountChips
            options={[
              { label: "50만", value: "50" },
              { label: "70만", value: "70" },
              { label: "90만", value: "90" },
              { label: "120만", value: "120" },
            ]}
            onPick={setMonthly}
          />
        </div>
        <Hint>
          관리비·공실·세금은 빼지 않은 단순 수익률입니다. 집을 비교할 때 첫 숫자로 쓰기 좋습니다.
        </Hint>
      </div>
    </CalcShell>
  )
}
