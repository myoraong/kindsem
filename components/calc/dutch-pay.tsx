"use client"

import { useMemo, useState } from "react"
import { CheckRow } from "@/components/calc/check-row"
import { CalcShell } from "@/components/calc/calc-shell"
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
        <MoneyField id="bill" label="총액" unit="원" value={total} onChange={setTotal} />
        <MoneyField id="people" label="인원" unit="명" value={people} onChange={setPeople} />
        <MoneyField id="tip" label="팁·봉사료" unit="%" value={tip} onChange={setTip} />
        <CheckRow id="ceil" checked={ceil} onChange={setCeil}>
          원 단위 올림
        </CheckRow>
        <p className="text-sm leading-6 text-muted-foreground">
          남는 돈은 먼저 낸 사람이 가져가거나, 다음 모임 적립으로 두면 됩니다.
        </p>
      </div>
    </CalcShell>
  )
}
