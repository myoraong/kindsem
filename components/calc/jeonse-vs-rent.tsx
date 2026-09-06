"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { RentSiblingHint } from "@/components/calc/sibling-hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatPercent, formatWon, kakaoCopyLine, manwonToWon } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { calcJeonseVsRent } from "@/lib/jeonse-vs-rent"
import type { CalcItem } from "@/lib/catalog"
import { useCalcPersist } from "@/lib/use-calc-persist"

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
  const [v, set] = useCalcPersist(item.slug, {
    jeonse: "20000",
    deposit: "5000",
    monthly: "70",
    base: "2.75",
    interest: "",
  })

  const result = useMemo(() => {
    return calcJeonseVsRent({
      jeonse: manwonToWon(Number(v.jeonse) || 0),
      monthlyDeposit: manwonToWon(Number(v.deposit) || 0),
      monthlyRent: manwonToWon(Number(v.monthly) || 0),
      baseRate: (Number(v.base) || 0) / 100,
      jeonseInterestMonthly: v.interest === "" ? 0 : manwonToWon(Number(v.interest) || 0),
    })
  }, [v])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="전세 대비 월세 상한"
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
        <RentSiblingHint here="jeonse-vs-rent" />
        <div className="space-y-2">
          <MoneyField id="jeonse" label="전세 보증금" value={v.jeonse} onChange={(value) => set("jeonse", value)} />
          <AmountChips
            options={[
              { label: "1억", value: "10000" },
              { label: "2억", value: "20000" },
              { label: "3억", value: "30000" },
              { label: "5억", value: "50000" },
            ]}
            onPick={(value) => set("jeonse", value)}
          />
        </div>
        <div className="space-y-2">
          <MoneyField id="deposit" label="월세 보증금" value={v.deposit} onChange={(value) => set("deposit", value)} />
          <AmountChips
            options={[
              { label: "1천", value: "1000" },
              { label: "3천", value: "3000" },
              { label: "5천", value: "5000" },
              { label: "1억", value: "10000" },
            ]}
            onPick={(value) => set("deposit", value)}
          />
        </div>
        <div className="space-y-2">
          <MoneyField id="monthly" label="월세" value={v.monthly} onChange={(value) => set("monthly", value)} />
          <AmountChips
            options={[
              { label: "50만", value: "50" },
              { label: "70만", value: "70" },
              { label: "100만", value: "100" },
              { label: "150만", value: "150" },
            ]}
            onPick={(value) => set("monthly", value)}
          />
        </div>
        <MoneyField
          id="base"
          label="한국은행 기준금리"
          unit="%"
          value={v.base}
          onChange={(value) => set("base", value)}
        />
        <details className="rounded-xl bg-secondary/60 px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">전세대출 이자</summary>
          <div className="mt-3">
            <MoneyField
              id="interest"
              label="전세대출 월 이자"
              value={v.interest}
              onChange={(value) => set("interest", value)}
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
