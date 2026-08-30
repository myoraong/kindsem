"use client"

import { useMemo, useState } from "react"
import { CalcShell } from "@/components/calc/calc-shell"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { calcBrokerage } from "@/lib/brokerage"
import { formatWon, manwonToWon } from "@/lib/format"
import type { CalcItem } from "@/lib/catalog"

export function MovingCost({ item }: { item: CalcItem }) {
  const [deposit, setDeposit] = useState("5000")
  const [monthly, setMonthly] = useState("50")
  const [move, setMove] = useState("25")
  const [stuff, setStuff] = useState("30")
  const [insurance, setInsurance] = useState("8")

  const result = useMemo(() => {
    const d = manwonToWon(Number(deposit) || 0)
    const m = manwonToWon(Number(monthly) || 0)
    const moveWon = manwonToWon(Number(move) || 0)
    const stuffWon = manwonToWon(Number(stuff) || 0)
    const ins = manwonToWon(Number(insurance) || 0)
    if (!d && !m) return null
    const fee = calcBrokerage({
      deal: "wolse",
      property: "house",
      price: d,
      monthlyRent: m,
      includeVat: true,
    })
    const total = d + m + fee.total + moveWon + stuffWon + ins
    return { d, m, fee: fee.total, moveWon, stuffWon, ins, total }
  }, [deposit, monthly, move, stuff, insurance])

  return (
    <CalcShell
      item={item}
      result={
        <ResultReceipt
          title="첫 달 목돈"
          amount={result?.total ?? null}
          rows={
            result
              ? [
                  { label: "보증금", value: formatWon(result.d) },
                  { label: "첫 달 월세", value: formatWon(result.m) },
                  { label: "중개보수(상한+부가세)", value: formatWon(result.fee) },
                  { label: "이사비", value: formatWon(result.moveWon) },
                  { label: "생필품", value: formatWon(result.stuffWon) },
                  { label: "보증보험 등", value: formatWon(result.ins) },
                ]
              : []
          }
          empty="보증금과 월세만 넣어도 복비를 포함해 목돈이 나와요."
        />
      }
    >
      <div className="space-y-4">
        <MoneyField id="deposit" label="보증금" value={deposit} onChange={setDeposit} />
        <MoneyField id="monthly" label="월세" value={monthly} onChange={setMonthly} />
        <MoneyField id="move" label="이사비" value={move} onChange={setMove} />
        <MoneyField id="stuff" label="가구·생필품" value={stuff} onChange={setStuff} />
        <MoneyField
          id="ins"
          label="보증보험·기타"
          value={insurance}
          onChange={setInsurance}
        />
        <p className="text-sm leading-6 text-muted-foreground">
          중개보수는 주택 월세 법정 상한에 부가세 10%를 더한 값입니다. 실제 복비는 이보다 낮을 수
          있습니다.
        </p>
      </div>
    </CalcShell>
  )
}
