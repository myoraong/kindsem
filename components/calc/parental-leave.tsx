"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LeaveSiblingHint } from "@/components/calc/sibling-hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon, kakaoCopyLine } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { calcParentalLeave, type ParentalMode } from "@/lib/parental-leave"
import type { CalcItem } from "@/lib/catalog"
import { useCalcPersist } from "@/lib/use-calc-persist"

const FAQ = [
  {
    q: "상한·하한은 어디서 오나요?",
    a: "고용보험법 시행령 제95조입니다. 1~3개월 통상임금 100% 상한 250만 원, 4~6개월 100% 상한 200만 원, 7개월부터 80% 상한 160만 원, 하한은 모두 70만 원입니다. 2026.7.1. 시행 조문입니다.",
  },
  {
    q: "맞돌봄·한부모는요?",
    a: "제95조의3입니다. 출생 후 18개월 이내 부모가 모두 쓰면 1~6개월 상한이 사용 개월에 따라 250만~450만 원입니다. 한부모는 1~3개월 상한 300만 원입니다. 두 번째 육아휴직 한시 특례(제95조의2)는 없습니다.",
  },
]

export function ParentalLeave({ item }: { item: CalcItem }) {
  const [v, set] = useCalcPersist(item.slug, {
    monthly: "300",
    months: "12",
    mode: "general" as ParentalMode,
    both: "",
  })

  const result = useMemo(() => {
    const ordinary = Math.round((Number(v.monthly) || 0) * 10_000)
    return calcParentalLeave({
      monthlyOrdinary: ordinary,
      months: Number(v.months) || 0,
      mode: v.mode,
      bothMonths: v.both === "" ? Number(v.months) || 0 : Number(v.both) || 0,
    })
  }, [v])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="육아휴직 급여 합계"
          amount={result?.total ?? null}
          caption={
            result
              ? `1개월차 ${formatWon(result.firstMonth)} · ${result.months}개월`
              : undefined
          }
          copyLine={
            result
              ? kakaoCopyLine("육아휴직 급여", formatWon(result.total), `1개월차 ${formatWon(result.firstMonth)}`)
              : undefined
          }
          lawLine="고용보험법 시행령 제95조 · 하한 70만 원 · 1~3개월 상한 250만 · 4~6개월 200만 · 7개월부터 80% 160만"
          rows={
            result
              ? [
                  { label: "1개월차", value: formatWon(result.firstMonth) },
                  { label: `${result.months}개월차`, value: formatWon(result.lastMonth) },
                  { label: "합계", value: formatWon(result.total) },
                  {
                    label: "적용",
                    value:
                      v.mode === "both" ? "제95조의3 맞돌봄" : v.mode === "single" ? "제95조의3 한부모" : "제95조 일반",
                  },
                ]
              : []
          }
          empty="월 통상임금과 사용 개월만 넣으면 급여가 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <LeaveSiblingHint here="parental-leave" />
        <div className="space-y-2">
          <MoneyField
            id="ordinary"
            label="월 통상임금"
            value={v.monthly}
            onChange={(value) => set("monthly", value)}
          />
          <AmountChips
            options={[
              { label: "200만", value: "200" },
              { label: "250만", value: "250" },
              { label: "300만", value: "300" },
              { label: "400만", value: "400" },
            ]}
            onPick={(value) => set("monthly", value)}
          />
        </div>
        <div className="space-y-2">
          <MoneyField id="months" label="사용 개월" unit="개월" value={v.months} onChange={(value) => set("months", value)} />
          <AmountChips
            options={[
              { label: "3개월", value: "3" },
              { label: "6개월", value: "6" },
              { label: "12개월", value: "12" },
            ]}
            onPick={(value) => set("months", value)}
          />
        </div>
        <ChoiceGroup
          label="특례"
          value={v.mode}
          onChange={(value) => set("mode", value)}
          options={[
            { value: "general", label: "일반" },
            { value: "both", label: "맞돌봄" },
            { value: "single", label: "한부모" },
          ]}
        />
        {v.mode === "both" ? (
          <details className="rounded-xl bg-secondary/60 px-3 py-2" open>
            <summary className="cursor-pointer text-sm font-medium">부모 각각 사용 개월</summary>
            <div className="mt-3">
              <MoneyField
                id="both"
                label="상대도 쓴 개월"
                unit="개월"
                value={v.both}
                onChange={(value) => set("both", value)}
                placeholder={v.months}
              />
            </div>
          </details>
        ) : null}
        <Hint>
          월 통상임금은 육아휴직 시작일 기준입니다. 1개월을 채우지 못하면 제95조 제3항 일수 비례인데, 이
          화면은 월 단위만 계산합니다. 최대 기간은 남녀고용평등법을 확인하세요.
        </Hint>
        <LawNote lines={[LAW_SOURCES.parentalLeave]} />
      </div>
    </CalcShell>
  )
}
