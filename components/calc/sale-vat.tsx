"use client"

import { useMemo, useState } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatPercent, formatWon } from "@/lib/format"
import { VAT_RATE } from "@/lib/policy.generated"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "부가세는 몇 %인가요?",
    a: `부가가치세법 제30조 기본세율 ${formatPercent(VAT_RATE * 100, 0)}입니다. 면세·영세율 품목은 여기 없습니다.`,
  },
  {
    q: "포함 금액과 공급가는요?",
    a: `부가세 포함 금액을 넣으면 공급가 = 포함금액 ÷ 1.1 입니다. 공급가를 넣으면 부가세 ${formatPercent(VAT_RATE * 100, 0)}를 더합니다.`,
  },
]

export function SaleVat({ item }: { item: CalcItem }) {
  const [mode, setMode] = useState<"sale" | "vat">("sale")
  const [price, setPrice] = useState("89000")
  const [rate, setRate] = useState("20")
  const [vatMode, setVatMode] = useState<"add" | "split">("split")

  const result = useMemo(() => {
    const p = Number(price)
    const r = Number(rate)
    if (!p) return null
    if (mode === "sale") {
      const discount = p * (r / 100)
      const final = p - discount
      return {
        amount: final,
        rows: [
          { label: "정가", value: formatWon(p) },
          { label: "할인액", value: formatWon(discount) },
          { label: "할인율", value: `${r}%` },
        ],
      }
    }
    if (vatMode === "add") {
      const vat = p * VAT_RATE
      return {
        amount: p + vat,
        rows: [
          { label: "공급가액", value: formatWon(p) },
          { label: `부가세 ${formatPercent(VAT_RATE * 100, 0)}`, value: formatWon(vat) },
        ],
      }
    }
    const supply = p / (1 + VAT_RATE)
    const vat = p - supply
    return {
      amount: supply,
      rows: [
        { label: "부가세 포함 금액", value: formatWon(p) },
        { label: "부가세", value: formatWon(vat) },
      ],
    }
  }, [mode, price, rate, vatMode])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title={mode === "sale" ? "할인된 가격" : vatMode === "add" ? "부가세 포함" : "공급가액"}
          amount={result?.amount ?? null}
          rows={result?.rows ?? []}
          empty="금액만 넣으면 세일가와 부가세가 바로 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="무엇을 계산할까요"
          value={mode}
          onChange={setMode}
          options={[
            { value: "sale", label: "할인" },
            { value: "vat", label: "부가세" },
          ]}
        />
        <div className="space-y-2">
          <MoneyField
            id="price"
            label={mode === "sale" ? "정가" : vatMode === "add" ? "공급가액" : "부가세 포함 금액"}
            unit="원"
            value={price}
            onChange={setPrice}
          />
          <AmountChips
            options={[
              { label: "1만", value: "10000" },
              { label: "5만", value: "50000" },
              { label: "8.9만", value: "89000" },
              { label: "10만", value: "100000" },
              { label: "50만", value: "500000" },
            ]}
            onPick={setPrice}
          />
        </div>
        {mode === "sale" ? (
          <div className="space-y-2">
            <MoneyField id="rate" label="할인율" unit="%" value={rate} onChange={setRate} />
            <AmountChips
              options={[
                { label: "10%", value: "10" },
                { label: "20%", value: "20" },
                { label: "30%", value: "30" },
                { label: "50%", value: "50" },
              ]}
              onPick={setRate}
            />
          </div>
        ) : (
          <ChoiceGroup
            label="부가세 방향"
            value={vatMode}
            onChange={setVatMode}
            options={[
              { value: "split", label: "포함 금액 → 공급가" },
              { value: "add", label: `공급가 + ${formatPercent(VAT_RATE * 100, 0)}` },
            ]}
          />
        )}
        <Hint>
          할인과 부가세는 따로 셉니다. 면세·영세율, 개별소비세는 없습니다.
        </Hint>
      </div>
    </CalcShell>
  )
}
