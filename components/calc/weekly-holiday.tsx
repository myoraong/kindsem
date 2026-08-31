"use client"

import { useMemo, useState } from "react"
import { CheckRow } from "@/components/calc/check-row"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon, kakaoCopyLine } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { calcWeeklyHoliday, monthlyContractHours } from "@/lib/labor"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "주휴수당은 누가 받나요?",
    a: "근로기준법 제18조 제3항은 4주 평균 1주 소정근로가 15시간 미만이면 제55조 주휴를 적용하지 않습니다. 15시간 이상이고 그 주 소정근로일을 개근하면 유급 주휴가 있습니다.",
  },
  {
    q: "계산 식은 뭔가요?",
    a: "고용노동부가 쓰는 식은 (1주 소정근로시간 ÷ 40시간) × 8시간 × 시간급입니다. 주 40시간이면 8시간분입니다. 월급제면 월급을 월 소정근로시간으로 나눈 값이 시간급입니다. 월 소정시간은 최저임금법 시행령 제5조 (주소정+유급주휴)×365/7÷12 입니다.",
  },
]

export function WeeklyHoliday({ item }: { item: CalcItem }) {
  const [pay, setPay] = useState<"hourly" | "monthly">("hourly")
  const [hourly, setHourly] = useState("10030")
  const [monthly, setMonthly] = useState("2091420")
  const [weeklyHours, setWeeklyHours] = useState("40")
  const [attended, setAttended] = useState(true)

  const result = useMemo(() => {
    const hours = Number(weeklyHours)
    if (!hours) return null
    const wage =
      pay === "hourly"
        ? Number(hourly)
        : monthlyContractHours(hours) > 0
          ? Number(monthly) / monthlyContractHours(hours)
          : 0
    return calcWeeklyHoliday({
      hourlyWage: wage,
      weeklyHours: hours,
      attended,
    })
  }, [pay, hourly, monthly, weeklyHours, attended])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="1주 주휴수당"
          amount={result ? result.holidayPay : null}
          caption={
            result
              ? result.eligible
                ? attended
                  ? `주휴 ${result.holidayHours}시간`
                  : "주휴수당 없음"
                : "주 15시간 미만 · 제18조"
              : undefined
          }
          copyLine={
            result
              ? kakaoCopyLine(
                  "주휴수당",
                  formatWon(result.holidayPay),
                  result.eligible ? `주휴 ${result.holidayHours}시간` : "제18조",
                )
              : undefined
          }
          rows={
            result
              ? [
                  { label: "시간급", value: formatWon(result.workPay / Number(weeklyHours || 1)) },
                  { label: "근로수당", value: formatWon(result.workPay) },
                  { label: "주휴수당", value: formatWon(result.holidayPay) },
                  { label: "주 합계", value: formatWon(result.weeklyTotal) },
                  { label: "월 환산 주휴", value: formatWon(result.monthHoliday) },
                ]
              : []
          }
          empty="시급과 주 근로시간만 넣으면 주휴수당이 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="임금"
          value={pay}
          onChange={setPay}
          options={[
            { value: "hourly", label: "시급" },
            { value: "monthly", label: "월급" },
          ]}
        />
        {pay === "hourly" ? (
          <MoneyField id="hourly" label="시급" unit="원" value={hourly} onChange={setHourly} />
        ) : (
          <MoneyField
            id="monthly"
            label="월 통상임금"
            unit="원"
            value={monthly}
            onChange={setMonthly}
          />
        )}
        <MoneyField
          id="hours"
          label="1주 소정근로시간"
          unit="시간/주"
          value={weeklyHours}
          onChange={setWeeklyHours}
        />
        <CheckRow id="attended" checked={attended} onChange={setAttended}>
          그 주 소정근로일 개근
        </CheckRow>
        <Hint>
          월급제는 최저임금법 시행령 제5조 월 환산 시간으로 시급을 나눕니다. 주휴수당이 이미 월급에
          들어 있는 계약이면 아래 금액은 포함된 몫입니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.laborHoliday]} />
      </div>
    </CalcShell>
  )
}
