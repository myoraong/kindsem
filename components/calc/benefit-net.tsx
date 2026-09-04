"use client"

import { useMemo, useState } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon, manwonToWon } from "@/lib/format"
import { calcBenefitNet } from "@/lib/payroll"
import type { CalcItem } from "@/lib/catalog"

type BenefitKind = "unemployment" | "jobseek" | "training" | "other"

const BENEFITS: Record<
  BenefitKind,
  { label: string; taxable: boolean; taxKnown: boolean; note: string }
> = {
  unemployment: {
    label: "실업급여",
    taxable: false,
    taxKnown: true,
    note: "구직급여는 소득세 비과세입니다. 받은 금액이 실수령입니다.",
  },
  jobseek: {
    label: "구직촉진수당",
    taxable: false,
    taxKnown: false,
    note: "과세 여부는 안내문·원천징수 명세를 확인하세요. 여기서는 지급액을 그대로 둡니다.",
  },
  training: {
    label: "내일배움카드",
    taxable: false,
    taxKnown: true,
    note: "훈련기관에 지급되는 훈련비는 보통 통장에 안 들어옵니다. 본인 부담만 넣으세요.",
  },
  other: {
    label: "기타 지원금",
    taxable: false,
    taxKnown: false,
    note: "과세 여부를 모르면 세금을 빼지 않습니다. 안내문과 맞춰 보세요.",
  },
}

export function BenefitNet({ item }: { item: CalcItem }) {
  const [kind, setKind] = useState<BenefitKind>("unemployment")
  const [monthly, setMonthly] = useState("180")
  const [months, setMonths] = useState("6")

  const spec = BENEFITS[kind]
  const result = useMemo(() => {
    const monthWon = manwonToWon(Number(monthly) || 0)
    const n = Number(months) || 0
    if (monthWon <= 0 || n <= 0) return null
    return calcBenefitNet({ monthlyAmount: monthWon, months: n, taxable: spec.taxable })
  }, [kind, monthly, months, spec.taxable])

  return (
    <CalcShell
      item={item}
      faq={
        <FaqList
          items={[
            {
              q: "실업급여는 세금을 떼나요?",
              a: "구직급여는 소득세 비과세입니다. 받은 금액이 실수령입니다. 구직촉진수당 등 다른 지원금은 안내문을 확인하세요.",
            },
            {
              q: "내일배움카드는요?",
              a: "훈련기관에 지급되는 훈련비는 보통 통장에 안 들어옵니다. 본인 부담만 넣으세요. 과세 여부를 모르면 세금을 빼지 않습니다.",
            },
          ]}
        />
      }
      guide={
        <div className="space-y-4 text-foreground">
          <p>
            지원금마다 과세가 다릅니다. 실업급여는 비과세입니다. 과세 여부를 모르는 지원금은 3.3%를
            빼지 않고 지급액만 보여 줍니다.
          </p>
        </div>
      }
      result={
        <ResultReceipt
          title="실수령 합"
          amount={result?.netTotal ?? null}
          rows={
            result
              ? [
                  { label: "지급 합", value: formatWon(result.monthlyAmount * result.months) },
                  ...(spec.taxKnown
                    ? [{ label: "세금", value: formatWon(result.taxTotal) }]
                    : [{ label: "세금", value: "안내문 확인 · 빼지 않음" }]),
                  { label: "월 실수령", value: formatWon(result.netMonthly) },
                ]
              : []
          }
          empty="월 금액과 기간만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="지원 종류"
          value={kind}
          onChange={setKind}
          options={(Object.keys(BENEFITS) as BenefitKind[]).map((value) => ({
            value,
            label: BENEFITS[value].label,
          }))}
        />
        <Hint>{spec.note}</Hint>
        <div className="space-y-2">
          <MoneyField id="b" label="월 금액" value={monthly} onChange={setMonthly} />
          <AmountChips
            options={[
              { label: "150만", value: "150" },
              { label: "180만", value: "180" },
              { label: "200만", value: "200" },
              { label: "250만", value: "250" },
            ]}
            onPick={setMonthly}
          />
        </div>
        <div className="space-y-2">
          <MoneyField id="m" label="받는 기간" unit="개월" value={months} onChange={setMonths} />
          <AmountChips
            options={[
              { label: "3개월", value: "3" },
              { label: "4개월", value: "4" },
              { label: "6개월", value: "6" },
              { label: "9개월", value: "9" },
            ]}
            onPick={setMonths}
          />
        </div>
      </div>
    </CalcShell>
  )
}
