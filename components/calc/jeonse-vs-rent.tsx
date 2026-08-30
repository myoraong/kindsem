"use client"

import { useMemo, useState } from "react"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatPercent, formatWon, kakaoCopyLine, manwonToWon } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { calcJeonseVsRent } from "@/lib/jeonse-vs-rent"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "전환율은 어디서 오나요?",
    a: "주택임대차보호법 시행령 제9조 상한입니다. 연 10%와 한국은행 기준금리+2%p 중 낮은 쪽입니다. 시세 전환율은 넣지 않습니다.",
  },
  {
    q: "전세 월 부담은 뭔가요?",
    a: "전세대출 이자를 넣었을 때만 나옵니다. 보증금의 기회비용은 법령에 없어 계산하지 않습니다.",
  },
]

export function JeonseVsRent({ item }: { item: CalcItem }) {
  const [jeonse, setJeonse] = useState("20000")
  const [deposit, setDeposit] = useState("5000")
  const [monthly, setMonthly] = useState("70")
  const [base, setBase] = useState("2.75")
  const [interest, setInterest] = useState("")

  const result = useMemo(() => {
    return calcJeonseVsRent({
      jeonse: manwonToWon(Number(jeonse) || 0),
      monthlyDeposit: manwonToWon(Number(deposit) || 0),
      monthlyRent: manwonToWon(Number(monthly) || 0),
      baseRate: (Number(base) || 0) / 100,
      jeonseInterestMonthly: interest === "" ? 0 : manwonToWon(Number(interest) || 0),
    })
  }, [jeonse, deposit, monthly, base, interest])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="법정 상한 월세"
          amount={result?.monthlyCap ?? null}
          caption={
            result
              ? result.overCap
                ? `실제 월세가 상한 ${formatPercent(result.cap * 100, 2)}를 넘습니다`
                : `전환 상한 ${formatPercent(result.cap * 100, 2)}`
              : undefined
          }
          copyLine={
            result
              ? kakaoCopyLine(
                  "전세 vs 월세",
                  `상한 ${formatWon(result.monthlyCap)}`,
                  `월세 ${formatWon(result.monthlyRent)}`,
                )
              : undefined
          }
          lawLine="주택임대차보호법 제7조의2 · 시행령 제9조 · 상한 min(10%, 기준금리+2%p)"
          rows={
            result
              ? [
                  { label: "전환 보증금", value: formatWon(result.converted) },
                  { label: "실제 월세", value: formatWon(result.monthlyRent) },
                  {
                    label: "월세 − 상한",
                    value: formatWon(result.rentMinusCap),
                  },
                  ...(result.jeonseInterest
                    ? [
                        { label: "전세 대출이자(월)", value: formatWon(result.jeonseInterest) },
                        { label: "월세 월 부담", value: formatWon(result.rentBurden) },
                      ]
                    : []),
                ]
              : []
          }
          empty="전세 보증금과 월세만 넣으면 법정 상한과 비교됩니다."
        />
      }
    >
      <div className="space-y-5">
        <MoneyField id="jeonse" label="전세 보증금" value={jeonse} onChange={setJeonse} />
        <MoneyField id="deposit" label="월세 보증금" value={deposit} onChange={setDeposit} />
        <MoneyField id="monthly" label="월세" value={monthly} onChange={setMonthly} />
        <MoneyField
          id="base"
          label="한국은행 기준금리"
          unit="%"
          value={base}
          onChange={setBase}
        />
        <details className="rounded-xl bg-secondary/60 px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">전세대출 이자</summary>
          <div className="mt-3">
            <MoneyField
              id="interest"
              label="전세대출 월 이자"
              value={interest}
              onChange={setInterest}
            />
          </div>
        </details>
        <Hint>
          기준금리는 한국은행이 정합니다. 여기 값은 직접 넣는 숫자입니다. 상한은 기준금리+2%p와 연
          10% 중 낮은 쪽입니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.rentConvert]} />
      </div>
    </CalcShell>
  )
}
