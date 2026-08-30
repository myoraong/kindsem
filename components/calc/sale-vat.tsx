"use client"

import { useMemo, useState } from "react"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatPercent, formatWon } from "@/lib/format"
import { VAT_RATE } from "@/lib/policy.generated"
import type { CalcItem } from "@/lib/catalog"

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
        <MoneyField
          id="price"
          label={mode === "sale" ? "정가" : vatMode === "add" ? "공급가액" : "부가세 포함 금액"}
          unit="원"
          value={price}
          onChange={setPrice}
        />
        {mode === "sale" ? (
          <MoneyField id="rate" label="할인율" unit="%" value={rate} onChange={setRate} />
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
      </div>
    </CalcShell>
  )
}
