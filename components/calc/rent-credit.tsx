"use client"

import { useMemo, useState } from "react"
import { CheckRow } from "@/components/calc/check-row"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatPercent, formatWon, kakaoCopyLine, manwonToWon } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { calcRentCredit } from "@/lib/rent-credit"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "청년만 되나요?",
    a: "현행 조세특례제한법 제95조의2는 무주택 세대의 근로자면 됩니다. 총급여 8천만 원 이하, 월세액 연 1천만 원 한도입니다. 2026년 세제개편안의 한도 1,200만 원·청년 일괄 17%는 아직 법이 아니라 넣지 않았습니다.",
  },
  {
    q: "전용면적은요?",
    a: "대통령령으로 정하는 주택만 해당합니다. 전용면적·기준시가는 국세청 안내를 확인하세요. 이 화면은 적어 주신 월세와 총급여에 법정 한도·공제율만 곱습니다.",
  },
]

export function RentCredit({ item }: { item: CalcItem }) {
  const [monthly, setMonthly] = useState("70")
  const [salary, setSalary] = useState("4500")
  const [noHome, setNoHome] = useState(true)
  const [wageOnly, setWageOnly] = useState(true)
  const [globalIncome, setGlobalIncome] = useState("0")

  const result = useMemo(() => {
    return calcRentCredit({
      annualRent: manwonToWon(Number(monthly) || 0) * 12,
      totalSalary: manwonToWon(Number(salary) || 0),
      globalIncome: manwonToWon(Number(globalIncome) || 0),
      wageOnly,
      noHome,
    })
  }, [monthly, salary, wageOnly, globalIncome, noHome])

  const amount = result?.eligible ? result.credit : result ? 0 : null
  const caption = !result
    ? undefined
    : !result.eligible
      ? result.reason === "home"
        ? "무주택이 아니면 대상이 아닙니다"
        : result.reason === "salary"
          ? "총급여 8천만 원 초과"
          : "종합소득금액 7천만 원 초과"
      : `공제율 ${formatPercent(result.rate * 100, 0)}`

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="세액공제"
          amount={amount}
          caption={caption}
          copyLine={
            result?.eligible ? kakaoCopyLine("월세 세액공제", formatWon(result.credit)) : undefined
          }
          rows={
            result?.eligible
              ? [
                  { label: "연 월세", value: formatWon(manwonToWon(Number(monthly) || 0) * 12) },
                  { label: "인정 월세", value: formatWon(result.recognized) },
                  { label: "공제율", value: formatPercent(result.rate * 100, 0) },
                ]
              : []
          }
          empty="월세와 총급여만 넣으면 한도 안 공제액이 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <MoneyField id="rent" label="월세" value={monthly} onChange={setMonthly} />
        <MoneyField id="salary" label="총급여" value={salary} onChange={setSalary} />
        <CheckRow id="home" checked={noHome} onChange={setNoHome}>
          과세기간 종료일 무주택
        </CheckRow>
        <CheckRow id="wage" checked={wageOnly} onChange={setWageOnly}>
          근로소득만 있음
        </CheckRow>
        {wageOnly ? null : (
          <MoneyField
            id="global"
            label="종합소득금액"
            hint="근로 외 합산"
            value={globalIncome}
            onChange={setGlobalIncome}
          />
        )}
        <Hint>
          총급여 5,500만 원 이하(종합소득금액 4,500만 원 초과 제외)는 17%, 그 외 8천만 원 이하(종합소득 7천만
          초과 제외)는 15%입니다. 월세액 한도는 연 1천만 원입니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.rentCredit]} />
      </div>
    </CalcShell>
  )
}
