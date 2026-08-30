"use client"

import { useMemo, useState } from "react"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon, kakaoCopyLine } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { calcOvertimePay, ordinaryHourlyFromMonthly } from "@/lib/overtime"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "야간은 왜 0.5인가요?",
    a: "제56조 제3항은 오후 10시부터 다음 날 오전 6시 근로에 통상임금의 50% 이상을 가산하라고 합니다. 그 시간의 기본급은 연장·휴일·소정근로 쪽에서 이미 잡히므로 여기 야간은 가산만 더합니다.",
  },
  {
    q: "휴일 8시간을 넘으면요?",
    a: "제56조 제2항은 휴일근로 8시간 이내는 50%, 초과분은 100%를 가산합니다. 지급액으로는 8시간까지 1.5배, 넘는 시간은 2.0배입니다.",
  },
]

export function OvertimePay({ item }: { item: CalcItem }) {
  const [pay, setPay] = useState<"hourly" | "monthly">("hourly")
  const [hourly, setHourly] = useState("10030")
  const [monthly, setMonthly] = useState("2091420")
  const [weeklyHours, setWeeklyHours] = useState("40")
  const [overtime, setOvertime] = useState("10")
  const [night, setNight] = useState("4")
  const [holiday, setHoliday] = useState("0")

  const result = useMemo(() => {
    const wage =
      pay === "hourly"
        ? Number(hourly)
        : ordinaryHourlyFromMonthly(Number(monthly) || 0, Number(weeklyHours) || 0)
    return calcOvertimePay({
      hourlyWage: wage,
      overtimeHours: Number(overtime) || 0,
      nightHours: Number(night) || 0,
      holidayHours: Number(holiday) || 0,
    })
  }, [pay, hourly, monthly, weeklyHours, overtime, night, holiday])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="수당 합계"
          amount={result?.total ?? null}
          caption={result ? `통상시급 ${formatWon(Math.round(result.hourlyWage))}` : undefined}
          copyLine={
            result
              ? kakaoCopyLine("연장·야간·휴일 수당", formatWon(result.total), "제56조")
              : undefined
          }
          lawLine="근로기준법 제56조 · 연장 1.5 · 야간 가산 0.5 · 휴일 1.5(8시간 초과 2.0)"
          rows={
            result
              ? [
                  { label: "연장", value: formatWon(result.overtimePay) },
                  { label: "야간 가산", value: formatWon(result.nightPremium) },
                  { label: "휴일", value: formatWon(result.holidayPay) },
                ]
              : []
          }
          empty="시급과 연장·야간·휴일 시간만 넣으면 수당이 나옵니다."
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
          <MoneyField id="hourly" label="통상시급" unit="원" value={hourly} onChange={setHourly} />
        ) : (
          <MoneyField
            id="monthly"
            label="월 통상임금"
            unit="원"
            value={monthly}
            onChange={setMonthly}
          />
        )}
        <MoneyField id="overtime" label="연장시간" unit="시간" value={overtime} onChange={setOvertime} />
        <MoneyField id="night" label="야간시간 (22:00–06:00)" unit="시간" value={night} onChange={setNight} />
        <MoneyField id="holiday" label="휴일시간" unit="시간" value={holiday} onChange={setHoliday} />
        {pay === "monthly" ? (
          <details className="rounded-xl bg-secondary/60 px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium">월급 → 시급 환산</summary>
            <div className="mt-3">
              <MoneyField
                id="weekly"
                label="1주 소정근로시간"
                unit="시간/주"
                value={weeklyHours}
                onChange={setWeeklyHours}
              />
            </div>
          </details>
        ) : null}
        <Hint>
          야간은 가산만 더합니다. 같은 시간을 연장과 휴일에 겹쳐 넣으면 통상임금이 두 번 잡힙니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.laborOvertime]} />
      </div>
    </CalcShell>
  )
}
