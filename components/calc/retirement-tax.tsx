"use client"

import { useMemo, useState } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon, kakaoCopyLine } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { calcRetirementTax } from "@/lib/retirement-tax"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "퇴직금과 다른가요?",
    a: "법정 퇴직금은 받을 금액이고, 여기서는 그 금액에 붙는 퇴직소득세와 지방소득세입니다. 소득세법 제48조 근속연수공제·환산급여공제 뒤 제55조 세율입니다.",
  },
  {
    q: "근속연수는 어떻게 넣나요?",
    a: "1년 미만은 1년으로 봅니다. 월 단위 단수는 시행령 계산을 넣지 않아, 회사에서 알려 준 근속연수를 그대로 넣으면 됩니다.",
  },
]

export function RetirementTax({ item }: { item: CalcItem }) {
  const [payout, setPayout] = useState("10000")
  const [years, setYears] = useState("10")

  const result = useMemo(() => {
    return calcRetirementTax({
      payout: Math.round((Number(payout) || 0) * 10_000),
      years: Number(years) || 0,
    })
  }, [payout, years])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="퇴직소득세+지방소득세"
          amount={result?.total ?? null}
          headline={result && result.total === 0 ? "세금 없음" : undefined}
          caption={
            result
              ? result.total === 0
                ? "근속연수공제 안"
                : `소득세 ${formatWon(result.national)}`
              : undefined
          }
          copyLine={
            result
              ? kakaoCopyLine(
                  "퇴직소득세",
                  result.total === 0 ? "세금 없음" : formatWon(result.total),
                  `근속 ${result.years}년`,
                )
              : undefined
          }
          lawLine="소득세법 제48조·제55조. 지방소득세는 소득세의 10%."
          rows={
            result
              ? [
                  { label: "근속연수공제", value: formatWon(result.serviceDeduction) },
                  { label: "환산급여", value: formatWon(result.converted) },
                  { label: "환산급여공제", value: formatWon(result.convertedDeduction) },
                  { label: "과세표준", value: formatWon(result.taxable) },
                  { label: "소득세", value: formatWon(result.national) },
                  { label: "지방소득세", value: formatWon(result.local) },
                ]
              : []
          }
          empty="퇴직금과 근속연수만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <MoneyField id="pay" label="퇴직금" value={payout} onChange={setPayout} />
          <AmountChips
            options={[
              { label: "3천만", value: "3000" },
              { label: "5천만", value: "5000" },
              { label: "1억", value: "10000" },
              { label: "2억", value: "20000" },
            ]}
            onPick={setPayout}
          />
        </div>
        <MoneyField id="yr" label="근속연수" unit="년" value={years} onChange={setYears} />
        <Hint>
          중간정산·2013년 이전 근무분은 넣지 않았습니다. 명세서의 퇴직소득세와 몇 원 다를 수 있습니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.retirement]} />
      </div>
    </CalcShell>
  )
}
