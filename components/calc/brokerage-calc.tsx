"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CheckRow } from "@/components/calc/check-row"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { calcBrokerage, type DealType, type PropertyType } from "@/lib/brokerage"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LAW_SOURCES } from "@/lib/law-sources"
import { formatPercent, formatWon, manwonToWon } from "@/lib/format"
import { VAT_RATE } from "@/lib/policy.generated"
import type { CalcItem } from "@/lib/catalog"
import { LawNote } from "@/components/calc/law-note"
import { useCalcPersist } from "@/lib/use-calc-persist"

export function BrokerageCalc({ item }: { item: CalcItem }) {
  const [v, set] = useCalcPersist(item.slug, {
    deal: "wolse" as DealType,
    property: "house" as PropertyType,
    price: "5000",
    monthly: "65",
    paid: "8000",
    premium: "2000",
    vat: true,
  })

  const result = useMemo(() => {
    const p = manwonToWon(Number(v.price) || 0)
    const m = manwonToWon(Number(v.monthly) || 0)
    const paidWon = manwonToWon(Number(v.paid) || 0)
    const prem = manwonToWon(Number(v.premium) || 0)
    const amount =
      v.property === "presale" ? paidWon + prem : v.deal === "wolse" ? p + m : p
    if (!amount) return null
    return calcBrokerage({
      deal: v.deal,
      property: v.property,
      price: p,
      monthlyRent: m,
      paid: paidWon,
      premium: prem,
      includeVat: v.vat,
    })
  }, [v])

  return (
    <CalcShell
      item={item}
      faq={
        <FaqList
          items={[
            {
              q: "이 금액대로 내야 하나요?",
              a: "법정 상한입니다. 실제 복비는 이 안에서 협의합니다. 상한을 넘는 요구는 공인중개사법 위반입니다.",
            },
            {
              q: "월세 거래금액은 어떻게 세나요?",
              a: "보증금 + 월세 × 100입니다. 그 합이 5천만 원 미만이면 × 70입니다. 부가세는 주택 중개에도 붙을 수 있어, 포함 여부를 직접 켜고 끄세요.",
            },
          ]}
        />
      }
      result={
        <ResultReceipt
          title="중개보수 상한"
          amount={result?.total ?? null}
          caption={result ? result.rule : undefined}
          rows={
            result
              ? [
                  { label: "거래금액", value: formatWon(result.amount) },
                  { label: "상한 요율", value: formatPercent(result.rate * 100) },
                  { label: "수수료", value: formatWon(result.fee) },
                  { label: "부가세", value: formatWon(result.vat) },
                  ...(result.cap
                    ? [{ label: "한도액", value: formatWon(result.cap) }]
                    : []),
                ]
              : []
          }
          empty="거래 유형과 금액만 넣으면 법정 상한이 바로 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="거래 유형"
          value={v.deal}
          onChange={(value) => set("deal", value)}
          options={[
            { value: "sale", label: "매매" },
            { value: "jeonse", label: "전세" },
            { value: "wolse", label: "월세" },
          ]}
        />
        <ChoiceGroup
          label="대상"
          value={v.property}
          onChange={(value) => set("property", value)}
          options={[
            { value: "house", label: "주택" },
            { value: "officetel", label: "오피스텔" },
            { value: "presale", label: "분양권" },
            { value: "other", label: "상가·토지" },
          ]}
        />
        {v.property === "presale" ? (
          <>
            <MoneyField
              id="paid"
              label="낸 계약금·중도금"
              value={v.paid}
              onChange={(value) => set("paid", value)}
            />
            <MoneyField id="premium" label="프리미엄" value={v.premium} onChange={(value) => set("premium", value)} />
          </>
        ) : (
          <div className="space-y-2">
            <MoneyField
              id="price"
              label={v.deal === "sale" ? "매매가" : "보증금"}
              value={v.price}
              onChange={(value) => set("price", value)}
            />
            <AmountChips
              options={
                v.deal === "sale"
                  ? [
                      { label: "3억", value: "30000" },
                      { label: "5억", value: "50000" },
                      { label: "8억", value: "80000" },
                      { label: "10억", value: "100000" },
                      { label: "15억", value: "150000" },
                    ]
                  : [
                      { label: "5천만", value: "5000" },
                      { label: "1억", value: "10000" },
                      { label: "2억", value: "20000" },
                      { label: "3억", value: "30000" },
                      { label: "5억", value: "50000" },
                    ]
              }
              onPick={(value) => set("price", value)}
            />
          </div>
        )}
        {v.deal === "wolse" && v.property !== "presale" ? (
          <div className="space-y-2">
            <MoneyField id="monthly" label="월세" value={v.monthly} onChange={(value) => set("monthly", value)} />
            <AmountChips
              options={[
                { label: "50만", value: "50" },
                { label: "65만", value: "65" },
                { label: "80만", value: "80" },
                { label: "100만", value: "100" },
              ]}
              onPick={(value) => set("monthly", value)}
            />
          </div>
        ) : null}
        <CheckRow id="vat" checked={v.vat} onChange={(value) => set("vat", value)}>
          부가세 {formatPercent(VAT_RATE * 100, 0)} 포함
        </CheckRow>
        <Hint>
          법정 상한이며 실제 지급액은 이 안에서 협의합니다. 월세 거래금액은 보증금 + 월세 × 100이고,
          5천만 원 미만이면 × 70입니다. 분양권은 낸 돈과 프리미엄을 합칩니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.brokerage]} />
      </div>
    </CalcShell>
  )
}
