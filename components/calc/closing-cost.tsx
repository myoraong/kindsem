"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CheckRow } from "@/components/calc/check-row"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { calcAcquisition, stampDuty, type HomeCount } from "@/lib/acquisition"
import { calcBrokerage } from "@/lib/brokerage"
import { LAW_SOURCES } from "@/lib/law-sources"
import { formatWon, manwonToWon } from "@/lib/format"
import type { CalcItem } from "@/lib/catalog"
import { LawNote } from "@/components/calc/law-note"
import { BuySiblingHint } from "@/components/calc/sibling-hint"
import { useCalcPersist } from "@/lib/use-calc-persist"

export function ClosingCost({ item }: { item: CalcItem }) {
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
    const tax = calcAcquisition({
      price: p,
      homeCount: v.homes,
      adjustedArea: v.adjusted,
      over85: v.over85,
      firstHome: v.first,
      shrinkingArea: v.shrinking,
    })
    const fee = calcBrokerage({
      deal: "sale",
      property: "house",
      price: p,
      includeVat: true,
    })
    const stamp = stampDuty(p, true)
    const total = tax.total + fee.total + stamp
    return { tax, fee: fee.total, stamp, total }
  }, [v])

  return (
    <CalcShell
      item={item}
      faq={
        <FaqList
          items={[
            {
              q: "집값 말고 뭐가 들어가나요?",
              a: "취득세(지방교육세·농특세 포함), 중개보수 법정 상한(부가세 포함), 인지세입니다. 국민주택채권 할인료, 이사비, 화재보험, 법무사 보수는 빠집니다.",
            },
            {
              q: "복비는 꼭 이 금액인가요?",
              a: "법정 상한에 부가세를 더한 값입니다. 실제 복비는 이 안에서 낮출 수 있습니다.",
            },
          ]}
        />
      }
      result={
        <ResultReceipt
          title="매수 시 필요 비용"
          amount={result?.total ?? null}
          caption="집값과 별도로 나가는 현금"
          rows={
            result
              ? [
                  { label: "취득세 합계", value: formatWon(result.tax.total) },
                  { label: "중개보수(상한+부가세)", value: formatWon(result.fee) },
                  { label: "인지세", value: formatWon(result.stamp) },
                ]
              : []
          }
          empty="매매가만 넣으면 잔금 전에 준비할 현금이 모여요."
        />
      }
    >
      <div className="space-y-5">
        <BuySiblingHint here="closing-cost" />
        <MoneyField id="price" label="매매가" value={v.price} onChange={(value) => set("price", value)} />
        <AmountChips
          options={[
            { label: "3억", value: "30000" },
            { label: "6억 5천", value: "65000" },
            { label: "9억", value: "90000" },
            { label: "12억", value: "120000" },
          ]}
          onPick={(value) => set("price", value)}
        />
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
          <CheckRow id="close-adjusted" checked={v.adjusted} onChange={(value) => set("adjusted", value)}>
            조정대상지역
          </CheckRow>
        ) : null}
        <CheckRow id="close-over85" checked={v.over85} onChange={(value) => set("over85", value)}>
          전용 85㎡ 초과
        </CheckRow>
        {v.homes === "1" ? (
          <>
            <CheckRow id="close-first" checked={v.first} onChange={(value) => set("first", value)}>
              생애최초
            </CheckRow>
            {v.first ? (
              <CheckRow id="close-shrinking" checked={v.shrinking} onChange={(value) => set("shrinking", value)}>
                인구감소지역 주택
              </CheckRow>
            ) : null}
          </>
        ) : null}
        <Hint>
          국민주택채권 할인료, 이사비, 화재보험, 법무사 보수는 빠져 있습니다. 법무사 금액은 법령
          상한이 아니라 합계에 넣지 않습니다.
        </Hint>
        <LawNote
          lines={[
            LAW_SOURCES.acquisition,
            LAW_SOURCES.brokerage,
            LAW_SOURCES.stamp,
            LAW_SOURCES.firstHome,
          ]}
        />
      </div>
    </CalcShell>
  )
}
