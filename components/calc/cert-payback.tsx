"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon, manwonToWon } from "@/lib/format"
import { PAYROLL, calcCertPayback } from "@/lib/payroll"
import type { CalcItem } from "@/lib/catalog"
import { useCalcPersist } from "@/lib/use-calc-persist"

export function CertPayback({ item }: { item: CalcItem }) {
  const [v, set] = useCalcPersist(item.slug, {
    cost: "80",
    now: "3200",
    after: "3600",
  })

  const result = useMemo(() => {
    const currentAnnual = manwonToWon(Number(v.now) || 0)
    const afterAnnual = manwonToWon(Number(v.after) || 0)
    const costWon = manwonToWon(Number(v.cost) || 0)
    if (costWon <= 0 || currentAnnual <= 0) return null
    return calcCertPayback({
      cost: costWon,
      currentAnnual,
      raiseAnnual: Math.max(0, afterAnnual - currentAnnual),
      mealExempt: true,
    })
  }, [v])

  return (
    <CalcShell
      item={item}
      faq={
        <FaqList
          items={[
            {
              q: "세전으로 나누나요?",
              a: "아닙니다. 지금 연봉과 자격 후 연봉의 세후 실수령 차이로 비용을 나눕니다. 식대 비과세는 실수령·이직과 같습니다.",
            },
            {
              q: "합격·이직을 보장하나요?",
              a: "아닙니다. 적어 주신 연봉 상승이 실제로 나온다고 가정한 회수 기간입니다.",
            },
          ]}
        />
      }
      guide={
        <div className="space-y-4 text-foreground">
          <p>
            자격 비용과 연봉 상승을 세후 실수령 차이로 나눕니다. 합격·이직을 보장하지 않습니다.
          </p>
        </div>
      }
      result={
        <ResultReceipt
          title="회수 기간"
          amount={result?.months ?? null}
          kind="months"
          caption={
            result?.months != null
              ? "세후 상승으로 비용을 뽑는 기간"
              : result
                ? "세후 연봉이 늘지 않으면 회수되지 않습니다"
                : undefined
          }
          rows={
            result
              ? [
                  { label: "자격 비용", value: formatWon(result.cost) },
                  { label: "세후 연 상승", value: formatWon(result.annualNetRaise) },
                ]
              : []
          }
          empty="비용과 지금·이후 연봉만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <MoneyField id="cost" label="자격·수강 비용" value={v.cost} onChange={(value) => set("cost", value)} />
          <AmountChips
            options={[
              { label: "50만", value: "50" },
              { label: "80만", value: "80" },
              { label: "150만", value: "150" },
              { label: "300만", value: "300" },
            ]}
            onPick={(value) => set("cost", value)}
          />
        </div>
        <div className="space-y-2">
          <MoneyField id="now" label="지금 연봉" value={v.now} onChange={(value) => set("now", value)} />
          <AmountChips
            options={[
              { label: "3천만", value: "3000" },
              { label: "4천만", value: "4000" },
              { label: "5천만", value: "5000" },
            ]}
            onPick={(value) => set("now", value)}
          />
        </div>
        <div className="space-y-2">
          <MoneyField id="after" label="자격 후 연봉" value={v.after} onChange={(value) => set("after", value)} />
          <AmountChips
            options={[
              { label: "4천만", value: "4000" },
              { label: "5천만", value: "5000" },
              { label: "6천만", value: "6000" },
            ]}
            onPick={(value) => set("after", value)}
          />
        </div>
        <Hint>실수령은 이직 계산과 같은 4대보험 고시·소득세법 공제입니다. 식대 비과세 월 {formatWon(PAYROLL.mealExemptMonthly)}을 넣습니다.</Hint>
      </div>
    </CalcShell>
  )
}
