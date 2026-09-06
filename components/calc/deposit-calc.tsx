"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CheckRow } from "@/components/calc/check-row"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon, kakaoCopyLine, manwonToWon } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { calcDeposit, type DepositCompound, type DepositKind } from "@/lib/deposit"
import type { CalcItem } from "@/lib/catalog"
import { useCalcPersist } from "@/lib/use-calc-persist"

const FAQ = [
  {
    q: "은행 이율을 넣어 두었나요?",
    a: "없습니다. 특판·우대이율은 상품마다 달라 직접 넣습니다. 세후는 이자소득 원천징수 14%와 지방소득세 1.4%만 뺍니다.",
  },
  {
    q: "적금 단리는 어떻게 계산하나요?",
    a: "매달 넣은 돈에 남은 개월 수만큼 월이율을 곱합니다. 월 납입 × (연이율/12) × (n(n+1)/2) 입니다.",
  },
]

export function DepositCalc({ item }: { item: CalcItem }) {
  const [v, set] = useCalcPersist(item.slug, {
    kind: "savings" as DepositKind,
    compound: "simple" as DepositCompound,
    principal: "1000",
    monthly: "30",
    rate: "3.5",
    months: "12",
    afterTax: true,
  })

  const result = useMemo(() => {
    return calcDeposit({
      kind: v.kind,
      compound: v.compound,
      principal: manwonToWon(Number(v.principal) || 0),
      monthly: manwonToWon(Number(v.monthly) || 0),
      annualRate: Number(v.rate),
      months: Number(v.months),
    })
  }, [v])

  const interest = v.afterTax ? result?.netInterest : result?.grossInterest
  const total = v.afterTax ? result?.netTotal : result?.grossTotal

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title={v.afterTax ? "세후 만기" : "세전 만기"}
          amount={total ?? null}
          caption={result ? `이자 ${formatWon(interest ?? 0)}` : undefined}
          copyLine={
            result && total != null
              ? kakaoCopyLine("예적금", formatWon(total), v.afterTax ? "세후" : "세전")
              : undefined
          }
          rows={
            result
              ? [
                  { label: "원금", value: formatWon(result.principal) },
                  { label: "세전 이자", value: formatWon(result.grossInterest) },
                  { label: "세후 이자", value: formatWon(result.netInterest) },
                ]
              : []
          }
          empty="원금이나 월 납입, 이율, 기간만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="상품"
          value={v.kind}
          onChange={(value) => set("kind", value)}
          options={[
            { value: "savings", label: "예금" },
            { value: "installment", label: "적금" },
          ]}
        />
        <ChoiceGroup
          label="이자"
          value={v.compound}
          onChange={(value) => set("compound", value)}
          options={[
            { value: "simple", label: "단리" },
            { value: "monthly", label: "월복리" },
          ]}
        />
        {v.kind === "savings" ? (
          <div className="space-y-2">
            <MoneyField id="principal" label="원금" value={v.principal} onChange={(value) => set("principal", value)} />
            <AmountChips
              options={[
                { label: "100만", value: "100" },
                { label: "500만", value: "500" },
                { label: "1천만", value: "1000" },
                { label: "3천만", value: "3000" },
              ]}
              onPick={(value) => set("principal", value)}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <MoneyField id="monthly" label="월 납입" value={v.monthly} onChange={(value) => set("monthly", value)} />
            <AmountChips
              options={[
                { label: "10만", value: "10" },
                { label: "30만", value: "30" },
                { label: "50만", value: "50" },
                { label: "100만", value: "100" },
              ]}
              onPick={(value) => set("monthly", value)}
            />
          </div>
        )}
        <MoneyField id="rate" label="연이율" unit="%" value={v.rate} onChange={(value) => set("rate", value)} />
        <MoneyField id="months" label="기간" unit="개월" value={v.months} onChange={(value) => set("months", value)} />
        <CheckRow id="tax" checked={v.afterTax} onChange={(value) => set("afterTax", value)}>
          세후 (이자소득세 15.4%)
        </CheckRow>
        <Hint>특판·우대이율·중도해지는 넣지 않았습니다. 이율은 상품 안내를 그대로 적으세요.</Hint>
        <LawNote lines={[LAW_SOURCES.interest]} />
      </div>
    </CalcShell>
  )
}
