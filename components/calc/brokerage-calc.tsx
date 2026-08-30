"use client"

import { useMemo, useState } from "react"
import { CheckRow } from "@/components/calc/check-row"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { calcBrokerage, type DealType, type PropertyType } from "@/lib/brokerage"
import { LAW_SOURCES } from "@/lib/law-sources"
import { formatPercent, formatWon, manwonToWon } from "@/lib/format"
import type { CalcItem } from "@/lib/catalog"
import { LawNote } from "@/components/calc/law-note"

export function BrokerageCalc({ item }: { item: CalcItem }) {
  const [deal, setDeal] = useState<DealType>("wolse")
  const [property, setProperty] = useState<PropertyType>("house")
  const [price, setPrice] = useState("5000")
  const [monthly, setMonthly] = useState("65")
  const [paid, setPaid] = useState("8000")
  const [premium, setPremium] = useState("2000")
  const [vat, setVat] = useState(true)

  const result = useMemo(() => {
    const p = manwonToWon(Number(price) || 0)
    const m = manwonToWon(Number(monthly) || 0)
    const paidWon = manwonToWon(Number(paid) || 0)
    const prem = manwonToWon(Number(premium) || 0)
    const amount =
      property === "presale" ? paidWon + prem : deal === "wolse" ? p + m : p
    if (!amount) return null
    return calcBrokerage({
      deal,
      property,
      price: p,
      monthlyRent: m,
      paid: paidWon,
      premium: prem,
      includeVat: vat,
    })
  }, [deal, property, price, monthly, paid, premium, vat])

  return (
    <CalcShell
      item={item}
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
          value={deal}
          onChange={setDeal}
          options={[
            { value: "sale", label: "매매" },
            { value: "jeonse", label: "전세" },
            { value: "wolse", label: "월세" },
          ]}
        />
        <ChoiceGroup
          label="대상"
          value={property}
          onChange={setProperty}
          options={[
            { value: "house", label: "주택" },
            { value: "officetel", label: "오피스텔" },
            { value: "presale", label: "분양권" },
            { value: "other", label: "상가·토지" },
          ]}
        />
        {property === "presale" ? (
          <>
            <MoneyField
              id="paid"
              label="낸 계약금·중도금"
              value={paid}
              onChange={setPaid}
            />
            <MoneyField id="premium" label="프리미엄" value={premium} onChange={setPremium} />
          </>
        ) : (
          <MoneyField
            id="price"
            label={deal === "sale" ? "매매가" : "보증금"}
            value={price}
            onChange={setPrice}
          />
        )}
        {deal === "wolse" && property !== "presale" ? (
          <MoneyField id="monthly" label="월세" value={monthly} onChange={setMonthly} />
        ) : null}
        <CheckRow id="vat" checked={vat} onChange={setVat}>
          부가세 10% 포함
        </CheckRow>
        <p className="text-sm leading-6 text-muted-foreground">
          법정 상한이며 실제 지급액은 이 안에서 협의합니다. 월세 거래금액은 보증금 + 월세 × 100이고,
          5천만 원 미만이면 × 70입니다. 분양권은 낸 돈과 프리미엄을 합칩니다.
        </p>
        <LawNote lines={[LAW_SOURCES.brokerage]} />
      </div>
    </CalcShell>
  )
}
