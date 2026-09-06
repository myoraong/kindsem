"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatPercent, formatWon, manwonToWon } from "@/lib/format"
import {
  PAYROLL,
  SIDE_JOB_PRESETS,
  calcSideJobTax,
  type ExpenseMode,
  type SideJobPresetId,
} from "@/lib/payroll"
import type { CalcItem } from "@/lib/catalog"
import { useCalcPersist } from "@/lib/use-calc-persist"

export function SideJobTax({ item }: { item: CalcItem }) {
  const [v, set, setMany] = useCalcPersist(item.slug, {
    kind: "parttime" as SideJobPresetId,
    revenue: "2400",
    rate: String(Math.round(SIDE_JOB_PRESETS.parttime.expenseRate * 1000) / 10),
    expenseMode: "rate" as ExpenseMode,
    expenseAmount: "",
    basic: "150",
  })

  function pickKind(next: SideJobPresetId) {
    setMany({
      kind: next,
      rate: String(Math.round(SIDE_JOB_PRESETS[next].expenseRate * 1000) / 10),
      expenseMode: "rate",
    })
  }

  const result = useMemo(() => {
    return calcSideJobTax({
      revenue: manwonToWon(Number(v.revenue) || 0),
      expenseRate: (Number(v.rate) || 0) / 100,
      expenseAmount: manwonToWon(Number(v.expenseAmount) || 0),
      expenseMode: v.expenseMode,
      basicDeduction: manwonToWon(Number(v.basic) || 0),
    })
  }, [v])

  const preset = SIDE_JOB_PRESETS[v.kind]
  const withhold = PAYROLL.bizWithholdingNational + PAYROLL.bizWithholdingLocal

  return (
    <CalcShell
      item={item}
      faq={
        <FaqList
          items={[
            {
              q: "3.3%를 떼이면 끝인가요?",
              a: "아닙니다. 3% 소득세와 0.3% 지방소득세는 원천징수입니다. 이듬해 종소세에서 필요경비를 빼고 다시 계산해 환급되거나 더 낼 수 있습니다.",
            },
            {
              q: "경비율은 정확한가요?",
              a: "단순경비율은 국세청 업종코드 고시입니다. 여기는 알바·배달·프리랜서 코드를 넣고, 퍼센트를 직접 고칠 수 있습니다.",
            },
          ]}
        />
      }
      guide={
        <div className="space-y-4 text-foreground">
          <p className="font-medium">원천 3.3%</p>
          <p>사업소득 지급액의 3%와 지방소득세 0.3%입니다. 경비와 상관없이 먼저 떼입니다.</p>
          <p className="font-medium">종소세</p>
          <p>
            수입 − 필요경비(단순경비율) − 기본공제 후 소득세 누진, 지방소득세 10%입니다. 세율 구간은
            법제처 소득세법 제55조를 따릅니다.
          </p>
        </div>
      }
      result={
        <ResultReceipt
          title={result.settlement >= 0 ? "예상 환급" : "추가 납부"}
          amount={Math.abs(result.settlement)}
          caption={
            result.revenue
              ? result.settlement >= 0
                ? "원천징수가 종소세보다 많으면 돌려받습니다"
                : "종소세가 원천보다 많으면 더 냅니다"
              : undefined
          }
          rows={[
                  { label: "수입", value: formatWon(result.revenue) },
                  { label: "원천 소득세 3%", value: formatWon(result.withheldNational) },
                  { label: "원천 지방세 0.3%", value: formatWon(result.withheldLocal) },
                  { label: "원천 합 3.3%", value: formatWon(result.withheld) },
                  {
                    label: `필요경비 ${formatPercent(result.expenseRate * 100, 1)}`,
                    value: formatWon(result.expense),
                  },
                  { label: "소득금액", value: formatWon(result.incomeAmount) },
                  { label: "기본공제", value: formatWon(result.basicDeduction) },
                  { label: "과세표준", value: formatWon(result.taxableBase) },
                  {
                    label: `종소세 ${formatPercent(result.rate * 100, 0)} 구간`,
                    value: formatWon(result.incomeTax),
                  },
                  { label: "지방소득세", value: formatWon(result.localTax) },
                  { label: "종소세 합", value: formatWon(result.comprehensive) },
                  { label: "3.3% 후 수령", value: formatWon(result.revenue - result.withheld) },
                  { label: "종소세 후 수령", value: formatWon(result.revenue - result.comprehensive) },
                ]}
          empty=""
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="하는 일"
          value={v.kind}
          onChange={pickKind}
          options={[
            { value: "parttime", label: SIDE_JOB_PRESETS.parttime.label },
            { value: "delivery", label: SIDE_JOB_PRESETS.delivery.label },
            { value: "freelance", label: SIDE_JOB_PRESETS.freelance.label },
          ]}
        />
        <Hint>{preset.note}</Hint>
        <div className="space-y-2">
          <MoneyField id="rev" label="연 수입" value={v.revenue} onChange={(value) => set("revenue", value)} />
          <AmountChips
            options={[
              { label: "1,200만", value: "1200" },
              { label: "2,400만", value: "2400" },
              { label: "3,600만", value: "3600" },
              { label: "5,000만", value: "5000" },
            ]}
            onPick={(value) => set("revenue", value)}
          />
        </div>
        <ChoiceGroup
          label="필요경비"
          value={v.expenseMode}
          onChange={(value) => set("expenseMode", value)}
          options={[
            { value: "rate", label: "단순경비율" },
            { value: "amount", label: "금액" },
          ]}
        />
        {v.expenseMode === "rate" ? (
          <MoneyField id="exp" label="단순경비율" unit="%" value={v.rate} onChange={(value) => set("rate", value)} />
        ) : (
          <MoneyField id="exp-amt" label="필요경비" value={v.expenseAmount} onChange={(value) => set("expenseAmount", value)} />
        )}
        <MoneyField id="basic" label="기본공제" value={v.basic} onChange={(value) => set("basic", value)} />
        <Hint>
          원천 {formatPercent(withhold * 100, 1)}는 경비와 상관없이 떼이고, 종소세는 경비를 뺀 뒤
          누진합니다. 다른 소득이 있으면 합산과세라 이 화면보다 세액이 커질 수 있습니다.
        </Hint>
      </div>
    </CalcShell>
  )
}
