"use client"

import { useMemo, useState } from "react"
import { CheckRow } from "@/components/calc/check-row"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { calcAcquisition, type HomeCount } from "@/lib/acquisition"
import { LAW_SOURCES } from "@/lib/law-sources"
import { formatPercent, formatWon, manwonToWon } from "@/lib/format"
import type { CalcItem } from "@/lib/catalog"
import { LawNote } from "@/components/calc/law-note"

export function AcquisitionCalc({ item }: { item: CalcItem }) {
  const [price, setPrice] = useState("65000")
  const [homes, setHomes] = useState<HomeCount>("1")
  const [adjusted, setAdjusted] = useState(false)
  const [over85, setOver85] = useState(false)
  const [first, setFirst] = useState(true)
  const [shrinking, setShrinking] = useState(false)

  const result = useMemo(() => {
    const p = manwonToWon(Number(price) || 0)
    if (!p) return null
    return calcAcquisition({
      price: p,
      homeCount: homes,
      adjustedArea: adjusted,
      over85,
      firstHome: first,
      shrinkingArea: shrinking,
    })
  }, [price, homes, adjusted, over85, first, shrinking])

  return (
    <CalcShell
      item={item}
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
        <MoneyField id="price" label="취득가액" value={price} onChange={setPrice} />
        <ChoiceGroup
          label="취득 후 주택 수"
          value={homes}
          onChange={setHomes}
          options={[
            { value: "1", label: "1주택" },
            { value: "2", label: "2주택" },
            { value: "3", label: "3주택" },
            { value: "4+", label: "4주택+" },
          ]}
        />
        {homes !== "1" ? (
          <CheckRow id="adjusted" checked={adjusted} onChange={setAdjusted}>
            조정대상지역
          </CheckRow>
        ) : null}
        <CheckRow id="over85" checked={over85} onChange={setOver85}>
          전용 85㎡ 초과 (농특세)
        </CheckRow>
        {homes === "1" ? (
          <>
            <CheckRow id="first" checked={first} onChange={setFirst}>
              생애최초 감면
            </CheckRow>
            {first ? (
              <CheckRow id="shrinking" checked={shrinking} onChange={setShrinking}>
                인구감소지역 주택 (감면 한도 300만 원)
              </CheckRow>
            ) : null}
          </>
        ) : null}
        <p className="text-sm leading-6 text-muted-foreground">
          주택 유상취득만 계산합니다. 생애최초 감면은 취득세에서만 빠지고, 지방교육세는 산출세액
          기준으로 남습니다.
        </p>
        <LawNote
          lines={[LAW_SOURCES.acquisition, LAW_SOURCES.firstHome, LAW_SOURCES.rural]}
        />
      </div>
    </CalcShell>
  )
}
