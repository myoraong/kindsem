"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { calcSeverance, dailyOrdinaryWage, serviceDays } from "@/lib/labor"
import type { CalcItem } from "@/lib/catalog"
import { useCalcPersist } from "@/lib/use-calc-persist"

const FAQ = [
  {
    q: "월급×근속년수가 아닌가요?",
    a: "법정 퇴직금은 평균임금 30일분 × (근속일수 ÷ 365일)입니다. 평균임금은 퇴직일 전 3개월 임금 총액을 그 기간 일수로 나눈 값입니다. 월급만 넣고 곱한 숫자는 근로기준법 평균임금이 아닙니다.",
  },
  {
    q: "1년 미만이면요?",
    a: "근로자퇴직급여 보장법 제4조는 계속근로 1년 미만, 또는 4주 평균 주 15시간 미만이면 퇴직급여제도를 적용하지 않습니다. 그 경우 금액은 참고용으로만 보여 주고, 법정 의무는 없다고 표시합니다.",
  },
]

function parseDate(raw: string) {
  if (!raw) return null
  const d = new Date(`${raw}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function Severance({ item }: { item: CalcItem }) {
  const [v, set] = useCalcPersist(item.slug, {
    start: "2023-08-30",
    end: "2026-08-30",
    wage3m: "900",
    days3m: "90",
    monthlyOrdinary: "",
    weeklyHours: "40",
    weeklyDays: "5",
  })

  const result = useMemo(() => {
    const from = parseDate(v.start)
    const to = parseDate(v.end)
    const wage = (Number(v.wage3m) || 0) * 10_000
    const days = Number(v.days3m)
    if (!from || !to || wage <= 0 || days <= 0) return null
    const served = serviceDays(from, to)
    if (served <= 0) return null
    const ordinary = v.monthlyOrdinary
      ? dailyOrdinaryWage({
          monthlyOrdinary: Number(v.monthlyOrdinary) || 0,
          weeklyHours: Number(v.weeklyHours) || 40,
          weeklyDays: Number(v.weeklyDays) || 5,
        })
      : 0
    return calcSeverance({
      wage3m: wage,
      days3m: days,
      serviceDays: served,
      dailyOrdinary: ordinary,
    })
  }, [v])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title={result && !result.eligible ? "1년 미만 · 법정 의무 없음" : "법정 퇴직금"}
          amount={result && result.eligible ? result.amount : result && !result.eligible ? 0 : null}
          caption={
            result
              ? result.eligible
                ? `${result.usedLabel} 30일분 × ${result.years.toFixed(4)}년`
                : `계산값 ${formatWon(result.amount)} · 제4조 적용 제외`
              : undefined
          }
          rows={
            result
              ? [
                  { label: "계속근로", value: `${result.years.toFixed(2)}년` },
                  { label: "1일 평균임금", value: formatWon(result.averageDaily) },
                  {
                    label: "1일 통상임금",
                    value: result.ordinaryDaily ? formatWon(result.ordinaryDaily) : "—",
                  },
                  { label: "적용 1일분", value: formatWon(result.usedDaily) },
                  { label: "산식 금액", value: formatWon(result.amount) },
                ]
              : []
          }
          empty="기간과 3개월 임금만 넣으면 평균임금 퇴직금이 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">계속근로 시작일</span>
            <input
              type="date"
              value={v.start}
              onChange={(event) => set("start", event.target.value)}
              className="h-12 w-full rounded-xl border border-input bg-transparent px-3 text-lg outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">퇴직일</span>
            <input
              type="date"
              value={v.end}
              onChange={(event) => set("end", event.target.value)}
              className="h-12 w-full rounded-xl border border-input bg-transparent px-3 text-lg outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
        </div>
        <MoneyField
          id="wage3m"
          label="퇴직일 전 3개월 임금 총액"
          value={v.wage3m}
          onChange={(value) => set("wage3m", value)}
        />
        <AmountChips
          options={[
            { label: "600만", value: "600" },
            { label: "900만", value: "900" },
            { label: "1,200만", value: "1200" },
            { label: "1,500만", value: "1500" },
          ]}
          onPick={(value) => set("wage3m", value)}
        />
        <MoneyField
          id="days3m"
          label="그 3개월의 달력 일수"
          unit="일"
          value={v.days3m}
          onChange={(value) => set("days3m", value)}
        />
        <MoneyField
          id="ordinary"
          label="월 통상임금 (선택)"
          unit="원"
          value={v.monthlyOrdinary}
          onChange={(value) => set("monthlyOrdinary", value)}
        />
        {v.monthlyOrdinary ? (
          <>
            <MoneyField
              id="hours"
              label="1주 소정근로시간"
              unit="시간/주"
              value={v.weeklyHours}
              onChange={(value) => set("weeklyHours", value)}
            />
            <MoneyField
              id="days"
              label="1주 소정근로일"
              unit="일/주"
              value={v.weeklyDays}
              onChange={(value) => set("weeklyDays", value)}
            />
          </>
        ) : null}
        <Hint>
          3개월 일수는 달력 기준입니다. 1월 1일부터 3월 31일이면 90일입니다. 상여를 평균임금에 넣는지는
          지급 주기에 따라 달라서, 총액에 포함할지는 직접 정하세요.
        </Hint>
        <LawNote lines={[LAW_SOURCES.severance]} />
      </div>
    </CalcShell>
  )
}
