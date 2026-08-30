"use client"

import { useMemo, useState } from "react"
import { CalcShell } from "@/components/calc/calc-shell"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon, manwonToWon } from "@/lib/format"
import { calcCertPayback } from "@/lib/payroll"
import type { CalcItem } from "@/lib/catalog"

export function CertPayback({ item }: { item: CalcItem }) {
  const [cost, setCost] = useState("80")
  const [now, setNow] = useState("3200")
  const [after, setAfter] = useState("3600")

  const result = useMemo(() => {
    const currentAnnual = manwonToWon(Number(now) || 0)
    const afterAnnual = manwonToWon(Number(after) || 0)
    const costWon = manwonToWon(Number(cost) || 0)
    if (costWon <= 0 || currentAnnual <= 0) return null
    return calcCertPayback({
      cost: costWon,
      currentAnnual,
      raiseAnnual: Math.max(0, afterAnnual - currentAnnual),
      mealExempt: true,
    })
  }, [cost, now, after])

  return (
    <CalcShell
      item={item}
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
        <MoneyField id="cost" label="자격·수강 비용" value={cost} onChange={setCost} />
        <MoneyField id="now" label="지금 연봉" value={now} onChange={setNow} />
        <MoneyField id="after" label="자격 후 연봉" value={after} onChange={setAfter} />
        <Hint>실수령은 이직 계산과 같은 4대보험 고시·소득세법 공제입니다. 식대 비과세 월 20만 원을 넣습니다.</Hint>
      </div>
    </CalcShell>
  )
}
