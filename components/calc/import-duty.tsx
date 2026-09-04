"use client"

import { useMemo, useState } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CheckRow } from "@/components/calc/check-row"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon, kakaoCopyLine } from "@/lib/format"
import { calcImportDuty, DE_MINIMIS_USD, LIST_CLEARANCE_USD, LIST_CLEARANCE_US_USD } from "@/lib/import-duty"
import { LAW_SOURCES } from "@/lib/law-sources"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "목록통관과 소액면제가 다른가요?",
    a: "목록통관은 미화 150달러 이하(미국발 200달러)이고 대상 물품이면 수입신고 없이 비과세입니다. 목록통관에서 빠진 뒤 수입신고하면, 자가사용 미화 150달러 이하만 관세·부가세가 면제됩니다. 150달러를 넘으면 초과분이 아니라 전체 과세가격에 세금이 붙습니다.",
  },
  {
    q: "관세율은 왜 없나요?",
    a: "품목 HS 코드마다 관세율이 다릅니다. 여기 평균 관세율은 없습니다. 관세 금액이나 세율을 넣으면 부가세 10%만 (물품+관세)에 계산합니다. 개별소비세·교육세는 없습니다.",
  },
]

export function ImportDuty({ item }: { item: CalcItem }) {
  const [priceUsd, setPriceUsd] = useState("140")
  const [fx, setFx] = useState("")
  const [origin, setOrigin] = useState<"other" | "us">("other")
  const [excluded, setExcluded] = useState(false)
  const [dutyWon, setDutyWon] = useState("")
  const [dutyRate, setDutyRate] = useState("")

  const result = useMemo(() => {
    return calcImportDuty({
      priceUsd: Number(priceUsd) || 0,
      fxKrw: Number(fx) || 0,
      origin,
      listExcluded: excluded,
      dutyWon: dutyWon === "" ? undefined : Number(dutyWon) || 0,
      dutyRate: dutyRate === "" ? undefined : (Number(dutyRate) || 0) / 100,
    })
  }, [priceUsd, fx, origin, excluded, dutyWon, dutyRate])

  const headline = !result
    ? null
    : result.taxed
      ? (result.totalTax ?? result.vat ?? result.goodsKrw)
      : 0

  const title = !result
    ? "관세·부가세"
    : result.hsUnknown
      ? "물품 원화 · 관세 미확정"
      : result.taxed
        ? "관세·부가세"
        : "면세"

  const caption = !result
    ? undefined
    : result.taxFree === "list"
      ? `목록통관 비과세 · 미화 ${result.listLimit}달러 이하`
      : result.taxFree === "de-minimis"
        ? `소액면세 · 수입신고 · 미화 ${DE_MINIMIS_USD}달러 이하`
        : result.hsUnknown
          ? "HS 관세율은 여기 없습니다. 관세를 넣으면 부가세 10%를 계산합니다."
          : result.totalTax != null
            ? `관세+부가세 ${formatWon(result.totalTax)}`
            : undefined

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title={title}
          amount={headline}
          caption={caption}
          copyLine={
            result
              ? kakaoCopyLine(
                  "해외직구",
                  result.taxed
                    ? result.totalTax != null
                      ? formatWon(result.totalTax)
                      : "관세 미확정"
                    : "면세",
                  result.taxFree === "list"
                    ? "목록통관"
                    : result.taxFree === "de-minimis"
                      ? "소액면세"
                      : result.hsUnknown
                        ? "HS 미입력"
                        : "부가세 10%",
                )
              : undefined
          }
          lawLine={`목록통관 ${LIST_CLEARANCE_USD}달러(미국발 ${LIST_CLEARANCE_US_USD}달러) · 소액면세 ${DE_MINIMIS_USD}달러 · 부가세 10%는 관세 확정 후`}
          rows={
            result
              ? [
                  ...(result.goodsKrw != null
                    ? [{ label: "물품 원화", value: formatWon(result.goodsKrw) }]
                    : [{ label: "물품 원화", value: "환율을 넣으면 나옵니다", mute: true }]),
                  {
                    label: "관세",
                    value:
                      result.duty != null
                        ? formatWon(result.duty)
                        : "HS별 세율 · 직접 입력",
                    mute: result.duty == null,
                  },
                  {
                    label: "부가세 10%",
                    value: result.vat != null ? formatWon(result.vat) : "관세 확정 후",
                    mute: result.vat == null,
                  },
                ]
              : []
          }
          empty="물품 달러만 넣어도 목록통관·소액면세 여부가 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <MoneyField
            id="usd"
            label="물품가격"
            unit="달러"
            value={priceUsd}
            onChange={setPriceUsd}
          />
          <AmountChips
            options={[
              { label: "50달러", value: "50" },
              { label: "140달러", value: "140" },
              { label: `${LIST_CLEARANCE_USD}달러`, value: String(LIST_CLEARANCE_USD) },
              { label: `${LIST_CLEARANCE_US_USD}달러`, value: String(LIST_CLEARANCE_US_USD) },
            ]}
            onPick={setPriceUsd}
          />
        </div>
        <MoneyField
          id="fx"
          label="적용 환율"
          unit="원/달러"
          value={fx}
          onChange={setFx}
        />
        <ChoiceGroup
          label="발송지"
          value={origin}
          onChange={setOrigin}
          options={[
            { value: "other", label: "그 외" },
            { value: "us", label: "미국" },
          ]}
        />
        <CheckRow id="excluded" checked={excluded} onChange={setExcluded}>
          목록통관 배제 물품 (식품·의약품 등)
        </CheckRow>
        <details className="rounded-xl bg-secondary/60 px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">관세 (HS가 정해진 뒤)</summary>
          <div className="mt-3 space-y-4">
            <MoneyField id="duty" label="관세" unit="원" value={dutyWon} onChange={setDutyWon} />
            <MoneyField id="rate" label="관세율" unit="%" value={dutyRate} onChange={setDutyRate} />
          </div>
        </details>
        <Hint>
          환율은 관세청 고시 환율이 아니라 직접 넣는 숫자입니다. 국제운송비가 물품가격과 명백히 구분되면
          특송 고시는 그 운임을 빼 볼 수 있습니다. 여기 물품가격은 넣은 달러 그대로입니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.importDuty, LAW_SOURCES.importDeMinimis]} />
      </div>
    </CalcShell>
  )
}
