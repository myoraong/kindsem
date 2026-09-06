"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import type { CalcItem } from "@/lib/catalog"
import { formatWon, kakaoCopyLine, manwonToWon } from "@/lib/format"
import {
  calcPyeongPrice,
  convertAreaEntry,
  formatM2,
  formatPyeong,
  m2ToPyeong,
  pyeongToM2,
  type AreaUnit,
} from "@/lib/pyeong"
import { useCalcPersist } from "@/lib/use-calc-persist"

const FAQ = [
  {
    q: "1평은 몇 제곱미터인가요?",
    a: "1평은 3.3058㎡입니다. 1자(尺)를 10/33m로 두고 6자×6자를 곱한 값(400/121㎡)입니다. 1㎡는 0.3025평입니다. 3.3으로 나누면 조금 차이 납니다.",
  },
  {
    q: "평당가는 전용면적인가요, 공급면적인가요?",
    a: "호가·실거래 평당가는 보통 전용면적입니다. 공급면적으로 나누면 평당가가 낮아집니다. 카인드셈은 넣은 면적 그대로 나눕니다.",
  },
  {
    q: "평이 법령 단위인가요?",
    a: "계량에 관한 법률의 법정 단위는 ㎡입니다. 평은 관행 단위라 공부·계약서는 ㎡가 기준입니다.",
  },
]

function inputAreaUnit(
  mode: "area" | "price",
  direction: "toM2" | "toPyeong",
  priceUnit: AreaUnit,
): AreaUnit {
  if (mode === "price") return priceUnit
  return direction === "toM2" ? "pyeong" : "m2"
}

export function PyeongCalc({ item }: { item: CalcItem }) {
  const [v, set, setMany] = useCalcPersist(item.slug, {
    mode: "area" as "area" | "price",
    direction: "toM2" as "toM2" | "toPyeong",
    area: "24",
    price: "100000",
    priceUnit: "pyeong" as "pyeong" | "m2",
  })

  const areaResult = useMemo(() => {
    const n = Number(v.area)
    if (v.direction === "toM2") {
      const m2 = pyeongToM2(n)
      if (m2 == null) return null
      return {
        headline: formatM2(m2),
        caption: `${formatPyeong(n)} → ${formatM2(m2)}`,
        rows: [
          { label: "평", value: formatPyeong(n) },
          { label: "제곱미터", value: formatM2(m2) },
          { label: "1평", value: "3.3058㎡" },
        ],
        copyLine: kakaoCopyLine("평수", formatM2(m2), formatPyeong(n)),
      }
    }
    const pyeong = m2ToPyeong(n)
    if (pyeong == null) return null
    return {
      headline: formatPyeong(pyeong),
      caption: `${formatM2(n)} → ${formatPyeong(pyeong)}`,
      rows: [
        { label: "제곱미터", value: formatM2(n) },
        { label: "평", value: formatPyeong(pyeong) },
        { label: "1㎡", value: "0.3025평" },
      ],
      copyLine: kakaoCopyLine("평수", formatPyeong(pyeong), formatM2(n)),
    }
  }, [v])

  const priceResult = useMemo(() => {
    const row = calcPyeongPrice({
      priceWon: manwonToWon(Number(v.price) || 0),
      area: Number(v.area),
      unit: v.priceUnit,
    })
    if (!row) return null
    return {
      amount: row.perPyeong,
      caption: `㎡당 ${formatWon(row.perM2)}`,
      rows: [
        { label: "매매가", value: formatWon(manwonToWon(Number(v.price) || 0)) },
        { label: "면적", value: `${formatPyeong(row.pyeong)} · ${formatM2(row.m2)}` },
        { label: "평당", value: formatWon(row.perPyeong) },
        { label: "㎡당", value: formatWon(row.perM2) },
      ],
      copyLine: kakaoCopyLine("평당", formatWon(row.perPyeong), formatPyeong(row.pyeong)),
    }
  }, [v])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        v.mode === "area" ? (
          <ResultReceipt
            title={v.direction === "toM2" ? "제곱미터" : "평"}
            amount={null}
            headline={areaResult?.headline}
            caption={areaResult?.caption}
            rows={areaResult?.rows ?? []}
            copyLine={areaResult?.copyLine}
            empty="평이나 ㎡만 넣으면 서로 바꿉니다."
            lawLine="1평 = 3.3058㎡. 공부·계약서는 ㎡가 기준입니다."
          />
        ) : (
          <ResultReceipt
            title="평당 가격"
            amount={priceResult?.amount ?? null}
            caption={priceResult?.caption}
            rows={priceResult?.rows ?? []}
            copyLine={priceResult?.copyLine}
            empty="매매가와 면적만 넣으면 평당·㎡당이 나옵니다."
            lawLine="넣은 면적 그대로 나눕니다. 전용·공급은 직접 고르세요."
          />
        )
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="무엇을 계산할까요"
          value={v.mode}
          onChange={(value) => {
            const from = inputAreaUnit(v.mode, v.direction, v.priceUnit)
            const to = inputAreaUnit(value, v.direction, v.priceUnit)
            setMany({ mode: value, area: convertAreaEntry(v.area, from, to) })
          }}
          options={[
            { value: "area", label: "평 ↔ ㎡" },
            { value: "price", label: "평당 가격" },
          ]}
        />
        {v.mode === "area" ? (
          <ChoiceGroup
            label="방향"
            value={v.direction}
            onChange={(value) => {
              const from = v.direction === "toM2" ? "pyeong" : "m2"
              const to = value === "toM2" ? "pyeong" : "m2"
              setMany({ direction: value, area: convertAreaEntry(v.area, from, to) })
            }}
            options={[
              { value: "toM2", label: "평 → ㎡" },
              { value: "toPyeong", label: "㎡ → 평" },
            ]}
          />
        ) : (
          <ChoiceGroup
            label="면적 단위"
            value={v.priceUnit}
            onChange={(value) => {
              setMany({
                priceUnit: value,
                area: convertAreaEntry(v.area, v.priceUnit, value),
              })
            }}
            options={[
              { value: "pyeong", label: "평" },
              { value: "m2", label: "㎡" },
            ]}
          />
        )}
        {v.mode === "price" ? (
          <div className="space-y-2">
            <MoneyField id="price" label="매매가" value={v.price} onChange={(value) => set("price", value)} />
            <AmountChips
              options={[
                { label: "5억", value: "50000" },
                { label: "8억", value: "80000" },
                { label: "10억", value: "100000" },
                { label: "15억", value: "150000" },
                { label: "20억", value: "200000" },
              ]}
              onPick={(value) => set("price", value)}
            />
          </div>
        ) : null}
        <div className="space-y-2">
          <MoneyField
            id="area"
            label={v.mode === "price" ? "면적" : v.direction === "toM2" ? "평" : "제곱미터"}
            unit={
              v.mode === "price"
                ? v.priceUnit === "pyeong"
                  ? "평"
                  : "㎡"
                : v.direction === "toM2"
                  ? "평"
                  : "㎡"
            }
            value={v.area}
            onChange={(value) => set("area", value)}
          />
          <AmountChips
            options={
              (v.mode === "price" ? v.priceUnit === "pyeong" : v.direction === "toM2")
                ? [
                    { label: "18평", value: "18" },
                    { label: "24평", value: "24" },
                    { label: "32평", value: "32" },
                    { label: "34평", value: "34" },
                  ]
                : [
                    { label: "59㎡", value: "59" },
                    { label: "74㎡", value: "74" },
                    { label: "84㎡", value: "84" },
                    { label: "114㎡", value: "114" },
                  ]
            }
            onPick={(value) => set("area", value)}
          />
        </div>
        <Hint>
          3.3으로 나누면 관행 환산과 어긋납니다. 전용·공급면적은 직접 넣는 숫자를 따릅니다.
        </Hint>
      </div>
    </CalcShell>
  )
}
