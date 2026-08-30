"use client"

import { useMemo, useState } from "react"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon, kakaoCopyLine } from "@/lib/format"
import { calcProratePay, monthDaysFor, type ProrateMethod } from "@/lib/prorate-pay"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "법으로 정한 일할 방식이 있나요?",
    a: "근로기준법은 월급을 며칠로 나누라고 하나로 정하지 않습니다. 회사는 그 달 달력일 또는 30일로 나누는 경우가 많습니다. 취업규칙·근로계약이 있으면 그쪽을 따르세요.",
  },
]

export function ProratePay({ item }: { item: CalcItem }) {
  const now = new Date()
  const [monthly, setMonthly] = useState("3000000")
  const [workDays, setWorkDays] = useState("10")
  const [method, setMethod] = useState<ProrateMethod>("calendar")

  const monthDays = monthDaysFor(method, now.getFullYear(), now.getMonth())
  const result = useMemo(() => {
    return calcProratePay({
      monthly: Number(monthly),
      workDays: Number(workDays),
      monthDays,
    })
  }, [monthly, workDays, monthDays])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="근무분"
          amount={result?.amount ?? null}
          caption={result ? `${result.monthDays}일 기준 1일 ${formatWon(Math.round(result.daily))}` : undefined}
          copyLine={
            result ? kakaoCopyLine("월급 일할", formatWon(result.amount), `${result.workDays}일`) : undefined
          }
          rows={
            result
              ? [
                  { label: "월급", value: formatWon(Number(monthly)) },
                  { label: "그 달 일수", value: `${result.monthDays}일` },
                  { label: "근무일", value: `${result.workDays}일` },
                ]
              : []
          }
          empty="월급과 근무일만 넣으면 그 달 분이 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <MoneyField id="monthly" label="월급" unit="원" value={monthly} onChange={setMonthly} />
        <MoneyField id="work-days" label="근무일" unit="일" value={workDays} onChange={setWorkDays} />
        <ChoiceGroup
          label="나눌 일수"
          value={method}
          onChange={setMethod}
          options={[
            { value: "calendar", label: `달력 ${monthDaysFor("calendar", now.getFullYear(), now.getMonth())}일` },
            { value: "thirty", label: "30일" },
          ]}
        />
        <Hint>주휴·연차는 넣지 않습니다. 시급제는 알바 월급을 보세요.</Hint>
      </div>
    </CalcShell>
  )
}
