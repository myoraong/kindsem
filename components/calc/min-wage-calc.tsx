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
import { MIN_WAGE } from "@/lib/policy.generated"
import { calcMinWage } from "@/lib/min-wage"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "시급과 월급은 어디서 오나요?",
    a: `고용노동부가 최저임금법 제10조로 고시합니다. ${MIN_WAGE.year}년은 시간급 ${MIN_WAGE.hourly.toLocaleString("ko-KR")}원, 주 40시간 월 환산 ${MIN_WAGE.monthly.toLocaleString("ko-KR")}원(기준시간 ${MIN_WAGE.monthlyHours}시간, 유급주휴 8시간 포함)입니다. 적용 기간은 ${MIN_WAGE.from}부터 ${MIN_WAGE.to}까지입니다.`,
  },
  {
    q: "시급만 넣으면 월급이 나오나요?",
    a: `시급×그 주의 월 환산 시간입니다. 주 40시간이면 고시 ${MIN_WAGE.monthlyHours}시간을 곱합니다. 월급을 넣으면 그 시간으로 나눠 시급이 나옵니다. 큰 숫자는 그 환산액이고, 고시 최저와의 비교는 아래에 있습니다.`,
  },
  {
    q: "주 40시간이 아니면요?",
    a: "고시 월 환산 209시간은 주 소정 40시간 기준입니다. 다른 주시간은 최저임금법 시행령 제5조 (주소정+유급주휴)×365/7÷12 로 월 시간을 셉니다. 주 15시간 미만은 주휴가 없습니다.",
  },
]

export function MinWageCalc({ item }: { item: CalcItem }) {
  const [pay, setPay] = useState<"hourly" | "monthly">("hourly")
  const [hourly, setHourly] = useState(String(MIN_WAGE.hourly))
  const [monthly, setMonthly] = useState(String(MIN_WAGE.monthly))
  const [weeklyHours, setWeeklyHours] = useState("40")

  const result = useMemo(() => {
    return calcMinWage({
      hourlyWage: pay === "hourly" ? Number(hourly) || 0 : 0,
      monthlyWage: pay === "monthly" ? Number(monthly) || 0 : 0,
      weeklyHours: Number(weeklyHours) || 0,
    })
  }, [pay, hourly, monthly, weeklyHours])

  const hasPay = Boolean(result && result.userHourly > 0)
  const converted =
    result && hasPay
      ? pay === "hourly"
        ? { title: "환산 월급", amount: result.userMonthly, note: `시급 ${formatWon(result.userHourly)}` }
        : {
            title: "환산 시급",
            amount: Math.round(result.userHourly),
            note: `월급 ${formatWon(result.userMonthly)}`,
          }
      : null
  const amount = converted?.amount ?? result?.floorMonthly ?? null
  const caption = result
    ? result.meetsHourly == null && result.meetsMonthly == null
      ? `고시 시급 ${formatWon(result.hourly)}`
      : result.meetsHourly === false || result.meetsMonthly === false
        ? "최저임금에 못 미칩니다"
        : "최저임금 이상"
    : undefined

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title={converted?.title ?? `${result?.year ?? MIN_WAGE.year}년 월 최저`}
          amount={amount}
          caption={caption}
          copyLine={
            result
              ? kakaoCopyLine(
                  converted?.title ?? "최저임금",
                  formatWon(converted?.amount ?? result.floorMonthly),
                  converted
                    ? `${converted.note} · 주 ${weeklyHours}시간`
                    : `시급 ${formatWon(result.hourly)} · 주 ${weeklyHours}시간`,
                )
              : undefined
          }
          lawLine={`${MIN_WAGE.year}년 적용 최저임금 고시 · 시간급 ${MIN_WAGE.hourly.toLocaleString("ko-KR")}원 · 주 40시간 월 ${MIN_WAGE.monthlyHours}시간`}
          rows={
            result
              ? [
                  ...(result.userHourly > 0
                    ? [
                        {
                          label: pay === "hourly" ? "넣은 시급" : "넣은 월급",
                          value:
                            pay === "hourly"
                              ? formatWon(result.userHourly)
                              : formatWon(result.userMonthly),
                        },
                        {
                          label: pay === "hourly" ? "환산 월급" : "환산 시급",
                          value:
                            pay === "hourly"
                              ? formatWon(result.userMonthly)
                              : formatWon(Math.round(result.userHourly)),
                        },
                      ]
                    : []),
                  { label: "고시 시급", value: formatWon(result.hourly) },
                  { label: "고시 일급(8시간)", value: formatWon(result.dailyFull) },
                  { label: "이 주의 월 시간", value: `${result.monthlyHours.toFixed(result.monthlyHours % 1 === 0 ? 0 : 2)}시간` },
                  { label: "이 주의 월 최저", value: formatWon(result.floorMonthly) },
                  ...(result.userHourly > 0
                    ? [
                        {
                          label: "시급 차이",
                          value: formatWon(result.hourlyGap),
                        },
                      ]
                    : []),
                ]
              : []
          }
          empty="시급 또는 월급과 주 소정시간을 넣으면 환산액이 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="넣을 임금"
          value={pay}
          onChange={setPay}
          options={[
            { value: "hourly", label: "시급" },
            { value: "monthly", label: "월급" },
          ]}
        />
        {pay === "hourly" ? (
          <MoneyField id="hourly" label="내 시급" unit="원" value={hourly} onChange={setHourly} />
        ) : (
          <MoneyField id="monthly" label="내 월급" unit="원" value={monthly} onChange={setMonthly} />
        )}
        <MoneyField
          id="hours"
          label="1주 소정근로시간"
          unit="시간/주"
          value={weeklyHours}
          onChange={setWeeklyHours}
        />
        <Hint>
          시급을 넣으면 월 환산 시간을 곱한 월급이, 월급을 넣으면 그 시간으로 나눈 시급이 큰 숫자로 나옵니다. 주
          40시간은 고시 월 {MIN_WAGE.monthlyHours}시간을 씁니다. 월급제 최저 여부는 월급÷그 시간 ≥ 고시 시급인지만
          봅니다. 수습·감액 특례는 넣지 않았습니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.minWage]} />
      </div>
    </CalcShell>
  )
}
