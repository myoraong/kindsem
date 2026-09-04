"use client"

import { useMemo, useState } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CheckRow } from "@/components/calc/check-row"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon, kakaoCopyLine } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { MIN_WAGE } from "@/lib/policy.generated"
import { calcPartTimeMonth } from "@/lib/labor"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "주휴는 월급에 넣나요?",
    a: "주 15시간 이상이고 그 주 소정근로일을 개근하면 유급 주휴가 있습니다. 아래 월 합계는 근로기준법 제55조 주휴를 최저임금법 시행령 제5조 월 환산 시간으로 올린 값입니다. 주 15시간 미만이면 주휴는 0원입니다.",
  },
  {
    q: "4.345주를 곱하나요?",
    a: "시행령 제5조는 (1주 소정근로+유급주휴)×365/7÷12 입니다. 주 40시간이면 약 209시간입니다. 달력 4주로 나눈 값과는 다릅니다.",
  },
]

export function PartTimeMonth({ item }: { item: CalcItem }) {
  const [hourly, setHourly] = useState(String(MIN_WAGE.hourly))
  const [weeklyHours, setWeeklyHours] = useState("20")
  const [attended, setAttended] = useState(true)

  const result = useMemo(() => {
    return calcPartTimeMonth({
      hourlyWage: Number(hourly),
      weeklyHours: Number(weeklyHours),
      attended,
    })
  }, [hourly, weeklyHours, attended])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="월 환산"
          amount={result?.monthTotal ?? null}
          caption={
            result
              ? result.eligible
                ? attended
                  ? `주휴 ${result.holidayHours}시간 포함`
                  : "주휴수당 없음"
                : "주 15시간 미만 · 주휴 없음"
              : undefined
          }
          copyLine={
            result
              ? kakaoCopyLine("알바 월급", formatWon(result.monthTotal), `시급 ${formatWon(Number(hourly))}`)
              : undefined
          }
          rows={
            result
              ? [
                  { label: "주 근로", value: formatWon(result.workPay) },
                  { label: "주 주휴", value: formatWon(result.holidayPay) },
                  { label: "월 근로", value: formatWon(result.monthWork) },
                  { label: "월 주휴", value: formatWon(result.monthHoliday) },
                ]
              : []
          }
          empty="시급과 주 근로시간만 넣으면 월 환산이 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <MoneyField id="hourly" label="시급" unit="원" value={hourly} onChange={setHourly} />
          <AmountChips
            options={[
              { label: "고시", value: String(MIN_WAGE.hourly) },
              { label: "1.2만", value: "12000" },
              { label: "1.5만", value: "15000" },
              { label: "2만", value: "20000" },
            ]}
            onPick={setHourly}
          />
        </div>
        <div className="space-y-2">
          <MoneyField
            id="hours"
            label="1주 소정근로시간"
            unit="시간/주"
            value={weeklyHours}
            onChange={setWeeklyHours}
          />
          <AmountChips
            options={[
              { label: "15시간", value: "15" },
              { label: "20시간", value: "20" },
              { label: "30시간", value: "30" },
              { label: "40시간", value: "40" },
            ]}
            onPick={setWeeklyHours}
          />
        </div>
        <CheckRow id="attended" checked={attended} onChange={setAttended}>
          주휴수당 포함
        </CheckRow>
        <Hint>
          월 환산은 최저임금법 시행령 제5조 시간입니다. 실제 근무 주 수가 다르면 주휴수당 계산기로 주 단위를
          보세요.
        </Hint>
        <LawNote lines={[LAW_SOURCES.laborHoliday]} />
      </div>
    </CalcShell>
  )
}
