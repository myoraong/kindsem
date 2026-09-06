"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon, manwonToWon } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { MIN_WAGE } from "@/lib/policy.generated"
import { calcAnnualLeave } from "@/lib/labor"
import type { CalcItem } from "@/lib/catalog"
import { useCalcPersist } from "@/lib/use-calc-persist"

const FAQ = [
  {
    q: "일수는 어떻게 나오나요?",
    a: "1년 미만은 1개월 개근 시 1일입니다. 1년 이상 80% 출근이면 15일이고, 3년 이상이면 1년을 넘는 근속 매 2년마다 1일을 더해 25일이 한도입니다. 회계연도 일괄 부여는 취업규칙이 근로자에게 불리하지 않을 때만 쓸 수 있어 여기선 입사일 기준 법정 일수만 냅니다.",
  },
  {
    q: "연차수당은요?",
    a: "쓰지 못한 날 × 1일 통상임금입니다. 1일 통상임금은 월 통상임금을 월 소정근로시간으로 나눈 뒤 1일 소정근로시간을 곱합니다. 상여·식대가 통상임금인지는 넣지 않았고, 적어 주신 월 통상임금만 씁니다.",
  },
]

export function AnnualLeave({ item }: { item: CalcItem }) {
  const [v, set] = useCalcPersist(item.slug, {
    years: "3",
    months: "6",
    weeklyHours: "40",
    weeklyDays: "5",
    ordinaryMan: String(Math.round(MIN_WAGE.monthly / 10_000)),
    unused: "",
  })

  const result = useMemo(() => {
    const y = Number(v.years)
    if (!Number.isFinite(y) || y < 0) return null
    return calcAnnualLeave({
      years: y,
      attendedMonths: Number(v.months) || 0,
      weeklyHours: Number(v.weeklyHours) || 0,
      weeklyDays: Number(v.weeklyDays) || 5,
      monthlyOrdinary: manwonToWon(Number(v.ordinaryMan) || 0),
      unusedDays: Number(v.unused) || 0,
    })
  }, [v])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="발생 연차"
          amount={result ? result.days : null}
          kind="days"
          caption={
            result
              ? result.eligible
                ? Number(v.unused) > 0 && result.allowance > 0
                  ? `미사용 수당 ${formatWon(result.allowance)}`
                  : "제60조 입사일 기준"
                : "주 15시간 미만 · 제18조"
              : undefined
          }
          rows={
            result
              ? [
                  { label: "발생 일수", value: `${result.days}일` },
                  { label: "1일 통상임금", value: result.dailyWage ? formatWon(result.dailyWage) : "—" },
                  { label: "미사용 일수", value: `${result.unused}일` },
                  { label: "연차수당", value: result.allowance ? formatWon(result.allowance) : "—" },
                ]
              : []
          }
          empty="근속연수만 넣으면 법정 일수가 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <MoneyField id="years" label="계속근로 연수" unit="년" value={v.years} onChange={(value) => set("years", value)} />
          <AmountChips
            options={[
              { label: "1년", value: "1" },
              { label: "3년", value: "3" },
              { label: "5년", value: "5" },
              { label: "10년", value: "10" },
            ]}
            onPick={(value) => set("years", value)}
          />
        </div>
        {Number(v.years) < 1 ? (
          <MoneyField
            id="months"
            label="1개월 개근한 개월"
            unit="개월"
            value={v.months}
            onChange={(value) => set("months", value)}
          />
        ) : null}
        <div className="space-y-2">
          <MoneyField
            id="hours"
            label="1주 소정근로시간"
            unit="시간/주"
            value={v.weeklyHours}
            onChange={(value) => set("weeklyHours", value)}
          />
          <AmountChips
            options={[
              { label: "15시간", value: "15" },
              { label: "20시간", value: "20" },
              { label: "30시간", value: "30" },
              { label: "40시간", value: "40" },
            ]}
            onPick={(value) => set("weeklyHours", value)}
          />
        </div>
        <ChoiceGroup
          label="1주 소정근로일"
          value={v.weeklyDays}
          onChange={(value) => set("weeklyDays", value)}
          options={[
            { value: "5", label: "5일" },
            { value: "6", label: "6일" },
          ]}
        />
        <div className="space-y-2">
          <MoneyField
            id="ordinary"
            label="월 통상임금"
            value={v.ordinaryMan}
            onChange={(value) => set("ordinaryMan", value)}
          />
          <AmountChips
            options={[
              { label: "고시", value: String(Math.round(MIN_WAGE.monthly / 10_000)) },
              { label: "250만", value: "250" },
              { label: "300만", value: "300" },
              { label: "350만", value: "350" },
            ]}
            onPick={(value) => set("ordinaryMan", value)}
          />
        </div>
        <div className="space-y-2">
          <MoneyField
            id="unused"
            label="미사용 일수"
            unit="일"
            value={v.unused}
            onChange={(value) => set("unused", value)}
            placeholder="없음"
          />
          <AmountChips
            options={[
              { label: "0일", value: "0" },
              { label: "5일", value: "5" },
              { label: "10일", value: "10" },
              { label: "15일", value: "15" },
            ]}
            onPick={(value) => set("unused", value)}
          />
        </div>
        <Hint>
          1년 미만은 개근 개월만 셉니다. 1년 도래 때의 15일과 겹쳐 더하지 않습니다. 출근율 80% 미만이면
          제60조 제2항(월 1일)만 해당하는데, 그 달은 개근 개월에 넣어 주세요.
        </Hint>
        <LawNote lines={[LAW_SOURCES.laborLeave]} />
      </div>
    </CalcShell>
  )
}
