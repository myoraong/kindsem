"use client"

import { useMemo, useState } from "react"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatPercent, formatWon, manwonToWon } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { calcRentConvert } from "@/lib/rent-convert"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "법정 상한은 고정인가요?",
    a: "아닙니다. 주택임대차보호법 시행령 제9조는 연 10%와 한국은행 기준금리에 2%포인트를 더한 비율 중 낮은 쪽입니다. 기준금리는 금통위가 정하므로 한국은행 공지를 넣어 주세요. 상가를 바꾸는 비율(상가건물 임대차보호법)은 여기 없습니다.",
  },
  {
    q: "약정 전환율이 상한을 넘으면요?",
    a: "제7조의2는 그 전환 금액에 대통령령 비율을 곱한 월차를 넘지 못하게 합니다. 결과는 법정 상한 월세(또는 환산 전세)를 크게 보여 주고, 약정 숫자는 참고로 둡니다.",
  },
]

export function RentConvert({ item }: { item: CalcItem }) {
  const [mode, setMode] = useState<"to-monthly" | "to-jeonse">("to-monthly")
  const [jeonse, setJeonse] = useState("20000")
  const [deposit, setDeposit] = useState("5000")
  const [monthly, setMonthly] = useState("60")
  const [agreed, setAgreed] = useState("4.75")
  const [base, setBase] = useState("2.75")

  const result = useMemo(() => {
    return calcRentConvert({
      mode,
      jeonse: manwonToWon(Number(jeonse) || 0),
      deposit: manwonToWon(Number(deposit) || 0),
      monthly: manwonToWon(Number(monthly) || 0),
      agreedRate: (Number(agreed) || 0) / 100,
      baseRate: (Number(base) || 0) / 100,
    })
  }, [mode, jeonse, deposit, monthly, agreed, base])

  const headline =
    mode === "to-monthly" ? "법정 상한 월세" : "법정 상한 환산 전세"

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title={headline}
          amount={result?.amount ?? null}
          caption={
            result
              ? result.overCap
                ? `약정이 상한 ${formatPercent(result.cap * 100, 2)}를 넘습니다`
                : `적용 ${formatPercent(result.appliedRate * 100, 2)}`
              : undefined
          }
          rows={
            result
              ? mode === "to-monthly"
                ? [
                    { label: "전환 보증금", value: formatWon(result.converted) },
                    { label: "법정 상한", value: formatPercent(result.cap * 100, 2) },
                    { label: "상한 월세", value: formatWon(result.monthlyCap) },
                    { label: "약정 월세", value: formatWon(result.monthlyAgreed) },
                  ]
                : [
                    { label: "법정 상한", value: formatPercent(result.cap * 100, 2) },
                    {
                      label: "상한 환산 전세",
                      value: formatWon(result.jeonseCap ?? 0),
                    },
                    {
                      label: "약정 환산 전세",
                      value: formatWon(result.jeonseAgreed ?? 0),
                    },
                  ]
              : []
          }
          empty="보증금과 기준금리만 넣으면 전환 월세가 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="방향"
          value={mode}
          onChange={setMode}
          options={[
            { value: "to-monthly", label: "전세 → 월세" },
            { value: "to-jeonse", label: "월세 → 전세" },
          ]}
        />
        {mode === "to-monthly" ? (
          <MoneyField id="jeonse" label="지금 전세 보증금" value={jeonse} onChange={setJeonse} />
        ) : (
          <MoneyField id="monthly" label="월세" value={monthly} onChange={setMonthly} />
        )}
        <MoneyField
          id="deposit"
          label={mode === "to-monthly" ? "바꿀 월세 보증금" : "남는 보증금"}
          value={deposit}
          onChange={setDeposit}
        />
        <MoneyField
          id="base"
          label="한국은행 기준금리"
          unit="%"
          value={base}
          onChange={setBase}
        />
        <MoneyField
          id="agreed"
          label="약정 전환율"
          unit="%"
          value={agreed}
          onChange={setAgreed}
        />
        <Hint>
          기준금리는 한국은행이 정합니다. 여기 적힌 값은 직접 넣는 숫자이고, 법제처에서 받아 오지
          않습니다. 상한은 기준금리+2%p와 연 10% 중 낮은 쪽입니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.rentConvert]} />
      </div>
    </CalcShell>
  )
}
