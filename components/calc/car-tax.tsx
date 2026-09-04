"use client"

import { useMemo, useState } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatPercent, formatWon, kakaoCopyLine } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { calcCarTax, type CarTaxKind } from "@/lib/vehicle"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "취득세와 같나요?",
    a: "다릅니다. 살 때 내는 건 자동차 취득세입니다. 이 화면은 소유분에 대한 자동차세(지방세법 제127조)와 지방교육세 30%입니다. 6월·12월에 나뉩니다.",
  },
  {
    q: "승합·화물은요?",
    a: "정원·적재량 정액표라 빼 두었습니다. 조례로 표준세율의 50%까지 올릴 수 있어, 시·군·구 고지와 다를 수 있습니다.",
  },
]

export function CarTax({ item }: { item: CalcItem }) {
  const [kind, setKind] = useState<CarTaxKind>("private")
  const [cc, setCc] = useState("1598")
  const [age, setAge] = useState("1")

  const result = useMemo(() => {
    return calcCarTax({
      kind,
      cc: Number(cc),
      ageYears: Number(age),
    })
  }, [kind, cc, age])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="연 자동차세 · 교육세"
          amount={result?.total ?? null}
          caption={
            result
              ? result.reliefRate
                ? `차령 경감 ${formatPercent(result.reliefRate * 100, 0)}`
                : "차령 경감 없음"
              : undefined
          }
          copyLine={result ? kakaoCopyLine("자동차세", formatWon(result.total), "교육세 포함") : undefined}
          rows={
            result
              ? [
                  { label: "산출 본세", value: formatWon(result.raw) },
                  { label: "납부 자동차세", value: formatWon(result.tax) },
                  { label: "지방교육세", value: formatWon(result.education) },
                ]
              : []
          }
          empty="배기량과 차령만 넣으면 연세액이 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="차종"
          value={kind}
          onChange={setKind}
          options={[
            { value: "private", label: "비영업 승용" },
            { value: "commercial", label: "영업 승용" },
            { value: "ev", label: "전기·수소 등" },
          ]}
        />
        {kind === "ev" ? null : (
          <div className="space-y-2">
            <MoneyField id="cc" label="배기량" unit="cc" value={cc} onChange={setCc} />
            <AmountChips
              options={[
                { label: "1000cc", value: "999" },
                { label: "1600cc", value: "1598" },
                { label: "2000cc", value: "1999" },
                { label: "2500cc", value: "2499" },
              ]}
              onPick={setCc}
            />
          </div>
        )}
        {kind === "private" ? (
          <div className="space-y-2">
            <MoneyField id="age" label="차령" unit="년" value={age} onChange={setAge} />
            <AmountChips
              options={[
                { label: "1년", value: "1" },
                { label: "3년", value: "3" },
                { label: "5년", value: "5" },
                { label: "12년", value: "12" },
              ]}
              onPick={setAge}
            />
          </div>
        ) : null}
        <Hint>
          비영업 승용은 1,000cc 이하 80원, 1,600cc 이하 140원, 초과 200원입니다. 차령 3년부터 매년 5%, 12년
          이상 50%입니다. 전기 등 배기량 없는 비영업 승용은 10만 원입니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.carTax]} />
      </div>
    </CalcShell>
  )
}
