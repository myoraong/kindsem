"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CheckRow } from "@/components/calc/check-row"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { calcAcquisition, type HomeCount } from "@/lib/acquisition"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LAW_SOURCES } from "@/lib/law-sources"
import { formatPercent, formatWon, manwonToWon } from "@/lib/format"
import type { CalcItem } from "@/lib/catalog"
import { LawNote } from "@/components/calc/law-note"
import { BuySiblingHint } from "@/components/calc/sibling-hint"
import { useCalcPersist } from "@/lib/use-calc-persist"

export function AcquisitionCalc({ item }: { item: CalcItem }) {
  const [v, set] = useCalcPersist(item.slug, {
    price: "65000",
    homes: "1" as HomeCount,
    adjusted: false,
    over85: false,
    first: false,
    shrinking: false,
  })

  const result = useMemo(() => {
    const p = manwonToWon(Number(v.price) || 0)
    if (!p) return null
    return calcAcquisition({
      price: p,
      homeCount: v.homes,
      adjustedArea: v.adjusted,
      over85: v.over85,
      firstHome: v.first,
      shrinkingArea: v.shrinking,
    })
  }, [v])

  return (
    <CalcShell
      item={item}
      faq={
        <FaqList
          items={[
            {
              q: "생애최초 감면이 기본인가요?",
              a: "아니요. 기본은 꺼 둡니다. 해당하면 생애최초 감면을 켜세요. 1주택·12억 이하일 때 200만 원 한도, 인구감소지역 주택은 300만 원 한도입니다. 요건은 직접 확인하세요.",
            },
            {
              q: "조정대상지역이면요?",
              a: "2주택 이상이면 중과 세율이 붙을 수 있습니다. 1주택은 조정지역이어도 일반 세율입니다.",
            },
          ]}
        />
      }
      result={
        <ResultReceipt
          title="예상 취득세 합계"
          amount={result?.total ?? null}
          caption={result?.policyLabel}
          rows={
            result
              ? [
                  { label: "적용 세율", value: formatPercent(result.rate * 100, 4) },
                  { label: "산출 취득세", value: formatWon(result.baseTax) },
                  { label: "생애최초 감면", value: formatWon(result.firstHomeRelief) },
                  { label: "납부 취득세", value: formatWon(result.acquisitionTax) },
                  { label: "지방교육세", value: formatWon(result.educationTax) },
                  { label: "농어촌특별세", value: formatWon(result.ruralTax) },
                ]
              : []
          }
          empty="집값과 주택 수만 넣으면 살 때 세금이 바로 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <BuySiblingHint here="acquisition" />
        <div className="space-y-2">
          <MoneyField id="price" label="취득가액" value={v.price} onChange={(value) => set("price", value)} />
          <AmountChips
            options={[
              { label: "3억", value: "30000" },
              { label: "6억 5천", value: "65000" },
              { label: "9억", value: "90000" },
              { label: "12억", value: "120000" },
              { label: "15억", value: "150000" },
            ]}
            onPick={(value) => set("price", value)}
          />
        </div>
        <ChoiceGroup
          label="취득 후 주택 수"
          value={v.homes}
          onChange={(value) => set("homes", value)}
          options={[
            { value: "1", label: "1주택" },
            { value: "2", label: "2주택" },
            { value: "3", label: "3주택" },
            { value: "4+", label: "4주택+" },
          ]}
        />
        {v.homes !== "1" ? (
          <CheckRow id="adjusted" checked={v.adjusted} onChange={(value) => set("adjusted", value)}>
            조정대상지역
          </CheckRow>
        ) : null}
        <CheckRow id="over85" checked={v.over85} onChange={(value) => set("over85", value)}>
          전용 85㎡ 초과 (농특세)
        </CheckRow>
        {v.homes === "1" ? (
          <>
            <CheckRow id="first" checked={v.first} onChange={(value) => set("first", value)}>
              생애최초 감면
            </CheckRow>
            {v.first ? (
              <CheckRow id="shrinking" checked={v.shrinking} onChange={(value) => set("shrinking", value)}>
                인구감소지역 주택 (감면 한도 300만 원)
              </CheckRow>
            ) : null}
          </>
        ) : null}
        <Hint>
          주택 유상취득만 계산합니다. 생애최초 감면 뒤 납부 취득세액의 10%가 지방교육세입니다.
          취득세가 전액 면제면 지방교육세도 없습니다. 중과 주택은 과세표준의 0.4%입니다.
        </Hint>
        <LawNote
          lines={[LAW_SOURCES.acquisition, LAW_SOURCES.firstHome, LAW_SOURCES.rural]}
        />
      </div>
    </CalcShell>
  )
}
