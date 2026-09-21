"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { CarSiblingHint } from "@/components/calc/sibling-hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatPercent, formatWon, kakaoCopyLine } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { asCarPrepay, calcCarTax, type CarPrepay, type CarTaxKind } from "@/lib/vehicle"
import type { CalcItem } from "@/lib/catalog"
import { useCalcPersist } from "@/lib/use-calc-persist"

const FAQ = [
  {
    q: "취득세와 같나요?",
    a: "다릅니다. 살 때 내는 건 자동차 취득세입니다. 이 화면은 소유분에 대한 자동차세(지방세법 제127조)와 지방교육세 30%입니다. 6월·12월에 나뉩니다.",
  },
  {
    q: "승합·화물은요?",
    a: "정원·적재량 정액표라 빼 두었습니다. 조례로 표준세율의 50%까지 올릴 수 있어, 시·군·구 고지와 다를 수 있습니다.",
  },
  {
    q: "연납은 언제 고르나요?",
    a: "분할이 기본입니다. 1월·3월·6월·9월은 남은 일수에 이자 5%를 곱해 자동차세를 깎고, 교육세는 그 다음입니다. 연 세액 10만 원 미만은 1월·3월만 연납됩니다.",
  },
]

export function CarTax({ item }: { item: CalcItem }) {
  const [v, set] = useCalcPersist(item.slug, {
    kind: "private" as CarTaxKind,
    cc: "1598",
    age: "1",
    prepay: "none" as CarPrepay,
  })

  const result = useMemo(() => {
    return calcCarTax({
      kind: v.kind,
      cc: Number(v.cc),
      ageYears: Number(v.age),
      prepay: asCarPrepay(v.prepay),
      year: new Date().getFullYear(),
    })
  }, [v])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title={
            result?.prepay === "sep"
              ? "9월에 낼 금액"
              : result && result.prepay !== "none"
                ? `${result.prepay === "jan" ? "1월" : result.prepay === "mar" ? "3월" : "6월"} 연납`
                : "연 자동차세 · 교육세"
          }
          amount={result?.total ?? null}
          caption={
            result
              ? [
                  result.reliefRate
                    ? `차령 경감 ${formatPercent(result.reliefRate * 100, 0)}`
                    : "차령 경감 없음",
                  result.prepay === "none"
                    ? null
                    : `${result.year}년 ${result.prepayNumer}/${result.prepayDenom}일 × 5%`,
                  result.prepay === "sep" ? "1기분은 6월에 공제 없이 나갑니다" : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : undefined
          }
          copyLine={result ? kakaoCopyLine("자동차세", formatWon(result.total), "교육세 포함") : undefined}
          rows={
            result
              ? [
                  { label: "산출 본세", value: formatWon(result.raw) },
                  {
                    label: result.prepay === "sep" ? "연 자동차세" : "납부 자동차세",
                    value: formatWon(result.tax),
                  },
                  ...(result.prepay === "none"
                    ? []
                    : [
                        ...(result.prepay === "sep"
                          ? [{ label: "2기분 자동차세", value: formatWon(Math.floor(result.tax / 2)) }]
                          : []),
                        { label: "연납 공제", value: formatWon(result.discount) },
                        { label: "공제 후 자동차세", value: formatWon(result.payableTax) },
                      ]),
                  { label: "지방교육세", value: formatWon(result.education) },
                ]
              : []
          }
          empty="배기량과 차령만 넣으면 연세액이 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <CarSiblingHint here="car-tax" />
        <ChoiceGroup
          label="차종"
          value={v.kind}
          onChange={(value) => set("kind", value)}
          options={[
            { value: "private", label: "비영업 승용" },
            { value: "commercial", label: "영업 승용" },
            { value: "ev", label: "전기·수소 등" },
          ]}
        />
        <ChoiceGroup
          label="납부"
          value={asCarPrepay(v.prepay)}
          onChange={(value) => set("prepay", value)}
          options={[
            { value: "none", label: "분할" },
            { value: "jan", label: "1월" },
            { value: "mar", label: "3월" },
            { value: "jun", label: "6월" },
            { value: "sep", label: "9월" },
          ]}
        />
        {result?.underPrepayMinimum ? (
          <Hint>
            {v.prepay === "jun" || v.prepay === "sep"
              ? "연 세액 10만 원 미만은 6월·9월 연납이 되지 않습니다. 이 숫자는 참고입니다."
              : "연 세액 10만 원 미만은 1월·3월만 연납됩니다."}
          </Hint>
        ) : null}
        {v.kind === "ev" ? null : (
          <div className="space-y-2">
            <MoneyField id="cc" label="배기량" unit="cc" value={v.cc} onChange={(value) => set("cc", value)} />
            <AmountChips
              options={[
                { label: "1000cc", value: "999" },
                { label: "1600cc", value: "1598" },
                { label: "2000cc", value: "1999" },
                { label: "2500cc", value: "2499" },
              ]}
              onPick={(value) => set("cc", value)}
            />
          </div>
        )}
        {v.kind === "private" ? (
          <div className="space-y-2">
            <MoneyField id="age" label="차령" unit="년" value={v.age} onChange={(value) => set("age", value)} />
            <AmountChips
              options={[
                { label: "1년", value: "1" },
                { label: "3년", value: "3" },
                { label: "5년", value: "5" },
                { label: "12년", value: "12" },
              ]}
              onPick={(value) => set("age", value)}
            />
          </div>
        ) : null}
        <Hint>
          비영업 승용은 1,000cc 이하 80원, 1,600cc 이하 140원, 초과 200원입니다. 차령 3년부터 매년 5%, 12년
          이상 50%입니다. 전기 등 배기량 없는 비영업 승용은 10만 원입니다. 연납 이자는 5%이고, 교육세는 공제
          뒤 자동차세의 30%입니다.
        </Hint>
        {result?.underPrepayMinimum ? (
          <Hint>
            {v.prepay === "jun" || v.prepay === "sep"
              ? "연 세액 10만 원 미만은 6월·9월 연납이 되지 않습니다. 이 숫자는 참고입니다."
              : "연 세액 10만 원 미만은 1월·3월만 연납됩니다."}
          </Hint>
        ) : null}
        <LawNote lines={[LAW_SOURCES.carTax]} />
      </div>
    </CalcShell>
  )
}
