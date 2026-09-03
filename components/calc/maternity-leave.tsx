"use client"

import { useMemo, useState } from "react"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatWon, kakaoCopyLine } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { MATERNITY_LEAVE } from "@/lib/policy.generated"
import { calcMaternityLeave, type MaternityKind } from "@/lib/maternity-leave"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "며칠을 받나요?",
    a: `근로기준법 제74조는 단태아 90일(미숙아 100일, 다태아 120일)입니다. 최초 ${MATERNITY_LEAVE.employerPaidDays.standard}일(다태아 ${MATERNITY_LEAVE.employerPaidDays.multiple}일)은 유급입니다. 고용보험법 제76조는 우선지원 대상기업이면 전 기간, 아니면 그 유급 일수를 넘는 날만(한도 30·40·45일) 고용보험에서 줍니다.`,
  },
  {
    q: "상한은 얼마인가요?",
    a: `출산전후휴가 급여등 상한액 고시입니다. 90일 ${formatCap(MATERNITY_LEAVE.cap.standard)}, 미숙아 100일 ${formatCap(MATERNITY_LEAVE.cap.preterm)}, 다태아 120일 ${formatCap(MATERNITY_LEAVE.cap.multiple)}. 지급 일수가 더 짧으면 그 일수로 나눕니다. 하한은 시작일 당시 시간급 최저임금으로 산정하는데, 이 화면은 넣은 월 통상임금만 씁니다.`,
  },
]

function formatCap(won: number) {
  return `${(won / 10_000).toLocaleString("ko-KR")}만 원`
}

export function MaternityLeave({ item }: { item: CalcItem }) {
  const [monthly, setMonthly] = useState("300")
  const [kind, setKind] = useState<MaternityKind>("standard")
  const [firm, setFirm] = useState<"priority" | "large">("priority")

  const result = useMemo(() => {
    return calcMaternityLeave({
      monthlyOrdinary: Math.round((Number(monthly) || 0) * 10_000),
      kind,
      priorityFirm: firm === "priority",
    })
  }, [monthly, kind, firm])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="고용보험 + 사업주"
          amount={result?.total ?? null}
          caption={
            result
              ? `휴가 ${result.periodDays}일 · 고용보험 ${result.eiDays}일`
              : undefined
          }
          copyLine={
            result
              ? kakaoCopyLine(
                  "출산전후휴가 급여",
                  formatWon(result.total),
                  `고용보험 ${formatWon(result.eiPay)}`,
                )
              : undefined
          }
          lawLine={`근로기준법 제74조 · 고용보험법 제76조 · 상한 90일 ${formatCap(MATERNITY_LEAVE.cap.standard)}`}
          rows={
            result
              ? [
                  { label: "휴가 일수", value: `${result.periodDays}일` },
                  { label: "고용보험 일수", value: `${result.eiDays}일` },
                  { label: "고용보험 급여", value: formatWon(result.eiPay) },
                  { label: "사업주 유급", value: formatWon(result.employerPay) },
                  { label: "합계", value: formatWon(result.total) },
                  {
                    label: "적용",
                    value: result.priorityFirm ? "우선지원 대상기업" : "그 외 사업장",
                  },
                ]
              : []
          }
          empty="월 통상임금과 출산 유형만 넣으면 급여가 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <MoneyField
          id="ordinary"
          label="월 통상임금"
          value={monthly}
          onChange={setMonthly}
        />
        <ChoiceGroup
          label="출산"
          value={kind}
          onChange={setKind}
          options={[
            { value: "standard", label: "단태아 90일" },
            { value: "preterm", label: "미숙아 100일" },
            { value: "multiple", label: "다태아 120일" },
          ]}
        />
        <ChoiceGroup
          label="사업장"
          value={firm}
          onChange={setFirm}
          options={[
            { value: "priority", label: "우선지원" },
            { value: "large", label: "그 외" },
          ]}
        />
        <Hint>
          통상임금은 휴가 시작일 기준입니다. 유산·사산 휴가, 기간제 계약 종료 후 잔여, 예술인·노무제공자는 이
          화면에 없습니다. 사업주가 미리 준 금품은 제104조 감액이 있을 수 있습니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.maternityLeave]} />
      </div>
    </CalcShell>
  )
}
