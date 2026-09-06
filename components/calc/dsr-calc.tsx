"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LimitSiblingHint } from "@/components/calc/sibling-hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { calculateDsr, type DsrBank } from "@/lib/dsr"
import { formatPercent, formatWon, manwonToWon } from "@/lib/format"
import { DSR_POLICY } from "@/lib/policy.generated"
import type { CalcItem } from "@/lib/catalog"
import { useCalcPersist } from "@/lib/use-calc-persist"

const DSR_FAQ = [
  {
    q: "DSR이 뭔가요?",
    a: "한 해 동안 갚는 대출 원리금을 연소득으로 나눈 값입니다. 주담대만 넣는 게 아니라 신용대출·자동차 할부까지 같이 봅니다.",
  },
  {
    q: "은행과 비은행 한도가 다른가요?",
    a: `은행은 연소득의 ${Math.round(DSR_POLICY.bank * 100)}%, 비은행은 ${Math.round(DSR_POLICY.nonbank * 100)}%까지입니다. 연봉 5천만 원이면 은행 기준으로 원리금 합이 연 2천만 원을 넘기지 않는 쪽으로 봅니다.`,
  },
]

export function DsrCalc({ item }: { item: CalcItem }) {
  const [v, set] = useCalcPersist(item.slug, {
    bank: "bank" as DsrBank,
    income: "5000",
    mortgage: "",
    other: "",
  })

  const result = useMemo(() => {
    return calculateDsr({
      incomeWon: manwonToWon(Number(v.income) || 0),
      mortgageMonthlyWon: manwonToWon(Number(v.mortgage) || 0),
      otherMonthlyWon: manwonToWon(Number(v.other) || 0),
      bank: v.bank,
    })
  }, [v])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={DSR_FAQ} />}
      guide={
        <div className="space-y-4 text-foreground">
          <p className="font-medium text-foreground">차주 단위 DSR</p>
          <p>
            은행 {Math.round(DSR_POLICY.bank * 100)}%, 비은행 {Math.round(DSR_POLICY.nonbank * 100)}
            %입니다. 주택담보만 보는 LTV와 달리, 갖고 있는 대출을 모두 더합니다. 스트레스 금리 가산은
            감독규정 별표에 없어 넣지 않습니다.
          </p>
        </div>
      }
      result={
        <ResultReceipt
          title="DSR"
          amount={result ? result.dsr * 100 : null}
          kind="percent"
          caption={
            result
              ? result.annual === 0
                ? `한도 ${formatPercent(result.limit * 100, 0)} · 대출 없음`
                : result.allowed
                  ? `한도 ${formatPercent(result.limit * 100, 0)} 안`
                  : `한도 ${formatPercent(result.limit * 100, 0)} 초과`
              : undefined
          }
          rows={
            result
              ? [
                  { label: "한도", value: formatPercent(result.limit * 100, 0) },
                  { label: "연 원리금", value: formatWon(result.annual) },
                  { label: "한도 원리금", value: formatWon(result.cap) },
                  { label: "남는 한도(연)", value: formatWon(result.remain) },
                  { label: "남는 한도(월)", value: formatWon(result.monthlyRemain) },
                ]
              : []
          }
          empty="연소득만 넣으면 한도가 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <LimitSiblingHint here="dsr" />
        <ChoiceGroup
          label="금융권"
          value={v.bank}
          onChange={(value) => set("bank", value)}
          options={[
            { value: "bank", label: `은행(${Math.round(DSR_POLICY.bank * 100)}%)` },
            { value: "nonbank", label: `비은행(${Math.round(DSR_POLICY.nonbank * 100)}%)` },
          ]}
        />
        <Hint>
          {v.bank === "bank"
            ? `1금융 주담대는 연소득의 ${Math.round(DSR_POLICY.bank * 100)}%까지입니다. 연봉 5천만 원이면 원리금 합 연 2천만 원 안쪽입니다.`
            : `2금융은 ${Math.round(DSR_POLICY.nonbank * 100)}%까지입니다. 같은 연봉이면 은행보다 한도가 조금 더 나옵니다.`}
        </Hint>
        <MoneyField id="inc" label="연소득" value={v.income} onChange={(value) => set("income", value)} />
        <AmountChips
          options={[
            { label: "3천만", value: "3000" },
            { label: "5천만", value: "5000" },
            { label: "7천만", value: "7000" },
            { label: "1억", value: "10000" },
          ]}
          onPick={(value) => set("income", value)}
        />
        <Hint>주담대·기타 대출은 없으면 비워 두세요. 연소득만으로도 남는 한도가 나옵니다.</Hint>
        <MoneyField id="m" label="주담대 월 상환액" value={v.mortgage} onChange={(value) => set("mortgage", value)} />
        <AmountChips
          options={[
            { label: "80만", value: "80" },
            { label: "120만", value: "120" },
            { label: "150만", value: "150" },
            { label: "200만", value: "200" },
          ]}
          onPick={(value) => set("mortgage", value)}
        />
        <MoneyField id="o" label="기타 대출 월 상환액" value={v.other} onChange={(value) => set("other", value)} />
      </div>
    </CalcShell>
  )
}
