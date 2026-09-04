"use client"

import { useMemo, useState } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CheckRow } from "@/components/calc/check-row"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon } from "@/lib/format"
import type { CalcItem } from "@/lib/catalog"

export function DutchPay({ item }: { item: CalcItem }) {
  const [total, setTotal] = useState("86000")
  const [people, setPeople] = useState("4")
  const [tip, setTip] = useState("0")
  const [ceil, setCeil] = useState(true)

  const result = useMemo(() => {
    const bill = Number(total)
    const count = Number(people)
    const tipRate = Number(tip)
    if (!bill || !count || count < 1) return null
    const withTip = bill + bill * (tipRate / 100)
    const raw = withTip / count
    const each = ceil ? Math.ceil(raw) : Math.round(raw)
    const collected = each * count
    return {
      withTip,
      each,
      leftover: collected - withTip,
    }
  }, [total, people, tip, ceil])

  return (
    <CalcShell
      item={item}
      faq={
        <FaqList
          items={[
            {
              q: "남은 돈은 어떻게 하나요?",
              a: "먼저 낸 사람이 가져가거나, 다음 모임에 적립하면 됩니다. 원 단위 올림을 켜면 거둔 금액이 총액보다 조금 많습니다.",
            },
          ]}
        />
      }
      result={
        <ResultReceipt
          title="1인 부담"
          amount={result?.each ?? null}
          rows={
            result
              ? [
                  { label: "전체 + 팁", value: formatWon(result.withTip) },
                  { label: "인원", value: `${people}명` },
                  { label: "거둔 금액", value: formatWon(result.each * Number(people)) },
                  { label: "남는 돈", value: formatWon(result.leftover) },
                ]
              : []
          }
          empty="총액과 인원을 넣으면 1인 금액이 나옵니다."
        />
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <MoneyField id="bill" label="총액" unit="원" value={total} onChange={setTotal} />
          <AmountChips
            options={[
              { label: "3만", value: "30000" },
              { label: "5만", value: "50000" },
              { label: "8만", value: "80000" },
              { label: "10만", value: "100000" },
              { label: "15만", value: "150000" },
            ]}
            onPick={setTotal}
          />
        </div>
        <div className="space-y-2">
          <MoneyField id="people" label="인원" unit="명" value={people} onChange={setPeople} />
          <AmountChips
            options={[
              { label: "2명", value: "2" },
              { label: "3명", value: "3" },
              { label: "4명", value: "4" },
              { label: "5명", value: "5" },
              { label: "6명", value: "6" },
              { label: "8명", value: "8" },
            ]}
            onPick={setPeople}
          />
        </div>
        <MoneyField id="tip" label="팁·봉사료" unit="%" value={tip} onChange={setTip} />
        <CheckRow id="ceil" checked={ceil} onChange={setCeil}>
          원 단위 올림
        </CheckRow>
        <Hint>남는 돈은 먼저 낸 사람이 가져가거나, 다음 모임 적립으로 두면 됩니다.</Hint>
      </div>
    </CalcShell>
  )
}
