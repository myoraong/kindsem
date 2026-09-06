"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt, type ReceiptRow } from "@/components/calc/result-receipt"
import { formatPercent, formatWon, manwonToWon } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { VAT_RATE } from "@/lib/policy.generated"
import {
  calcMovingTotal,
  type MovingDeal,
  type MovingLoanMethod,
} from "@/lib/moving"
import type { CalcItem } from "@/lib/catalog"
import { useCalcPersist } from "@/lib/use-calc-persist"

const MOVING_FAQ = [
  {
    q: "이사 당일 현금은 어떻게 세나요?",
    a: "보증금, 복비 상한(부가세 포함), 이삿짐, 생필품, 보증보험을 더하고, 월세면 첫 달 월세도 넣습니다. 그다음 대출금을 뺍니다. 대출이 더 크면 당일 현금은 0원입니다.",
  },
  {
    q: "복비는 꼭 이 금액인가요?",
    a: "법정 상한에 부가세를 더한 값입니다. 실제 복비는 이 안에서 낮출 수 있고, 임대인·임차인이 각자 내는 것이 원칙입니다.",
  },
  {
    q: "전세와 월세 복비가 다른가요?",
    a: "전세는 보증금이 거래금액입니다. 월세는 보증금 + 월세 × 100이고, 그 값이 5천만 원 미만이면 × 70으로 다시 셉니다.",
  },
  {
    q: "대출이 없으면요?",
    a: "없으면 비워 두세요. 대출 줄은 빠지고 당일 현금만 보여 줍니다. 금리와 기간은 금액을 넣은 뒤에 나옵니다.",
  },
]

export function MovingCost({ item }: { item: CalcItem }) {
  const [v, set] = useCalcPersist(item.slug, {
    deal: "jeonse" as MovingDeal,
    deposit: "10000",
    monthly: "50",
    move: "50",
    stuff: "30",
    insurance: "8",
    loan: "",
    rate: "3.5",
    years: "2",
    method: "interest-only" as MovingLoanMethod,
  })

  const loanEntered = (Number(v.loan) || 0) > 0

  const result = useMemo(() => {
    return calcMovingTotal({
      deal: v.deal,
      depositWon: manwonToWon(Number(v.deposit) || 0),
      monthlyRentWon: manwonToWon(Number(v.monthly) || 0),
      moveWon: manwonToWon(Number(v.move) || 0),
      stuffWon: manwonToWon(Number(v.stuff) || 0),
      insuranceWon: manwonToWon(Number(v.insurance) || 0),
      loanWon: manwonToWon(Number(v.loan) || 0),
      annualRatePercent: Number(v.rate) || 0,
      years: Number(v.years) || 0,
      loanMethod: v.method,
    })
  }, [v])

  const rows: ReceiptRow[] = result
    ? [
        { label: "보증금", value: formatWon(result.deposit) },
        ...(v.deal === "wolse"
          ? [{ label: "첫 달 월세", value: formatWon(result.monthlyRent) }]
          : []),
        { label: "복비 상한(부가세 포함)", value: formatWon(result.brokerage.total) },
        { label: "이삿짐", value: formatWon(result.move) },
        { label: "생필품", value: formatWon(result.stuff) },
        { label: "보증보험", value: formatWon(result.insurance) },
        ...(result.hasLoan
          ? [{ label: "대출금", value: `−${formatWon(result.loan)}` }]
          : [{ label: "대출", value: "없음", mute: true }]),
        ...(result.loanSurplus > 0
          ? [{ label: "남는 대출", value: formatWon(result.loanSurplus), mute: true }]
          : []),
        ...(result.loanReady && result.monthlyLabel
          ? [
              { label: result.monthlyLabel, value: formatWon(result.monthlyPay) },
              { label: "1년 이자", value: formatWon(result.annualInterest) },
            ]
          : []),
        ...(result.hasLoan && !result.loanReady
          ? [{ label: "대출 이자", value: "기간을 넣어 주세요", mute: true }]
          : []),
      ]
    : []

  const caption = result
    ? result.hasLoan && result.cashOnDay === 0
      ? "대출이 당일 비용을 모두 충당합니다"
      : "법정 복비 상한 + 입력한 비용"
    : undefined

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={MOVING_FAQ} />}
      result={
        <ResultReceipt
          title="이사 당일 현금"
          amount={result?.cashOnDay ?? null}
          caption={caption}
          rows={rows}
          empty="보증금이나 이사 비용만 넣어도 복비를 포함해 당일 현금이 나와요."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="거래"
          value={v.deal}
          onChange={(value) => set("deal", value)}
          options={[
            { value: "jeonse", label: "전세" },
            { value: "wolse", label: "월세" },
          ]}
        />
        <div className="space-y-2">
          <MoneyField id="deposit" label="보증금" value={v.deposit} onChange={(value) => set("deposit", value)} />
          <AmountChips
            options={[
              { label: "5천", value: "5000" },
              { label: "1억", value: "10000" },
              { label: "2억", value: "20000" },
              { label: "3억", value: "30000" },
            ]}
            onPick={(value) => set("deposit", value)}
          />
        </div>
        {v.deal === "wolse" ? (
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
        ) : null}
        <MoneyField id="move" label="이삿짐 견적" value={v.move} onChange={(value) => set("move", value)} />
        <MoneyField id="stuff" label="가구·생필품" value={v.stuff} onChange={(value) => set("stuff", value)} />
        <MoneyField
          id="ins"
          label="보증보험·기타"
          value={v.insurance}
          onChange={(value) => set("insurance", value)}
        />
        <MoneyField
          id="loan"
          label="빌릴 금액"
          value={v.loan}
          onChange={(value) => set("loan", value)}
          placeholder="없음"
        />
        {loanEntered ? (
          <>
            <MoneyField id="rate" label="연 금리" unit="%" value={v.rate} onChange={(value) => set("rate", value)} />
            <MoneyField id="years" label="기간" unit="년" value={v.years} onChange={(value) => set("years", value)} />
            <ChoiceGroup
              label="상환 방식"
              value={v.method}
              onChange={(value) => set("method", value)}
              options={[
                { value: "equal-payment", label: "원리금균등" },
                { value: "interest-only", label: "이자만" },
              ]}
            />
          </>
        ) : (
          <Hint>없으면 비워 두세요. 대출 없이 당일 현금만 셉니다.</Hint>
        )}
        <Hint>
          복비는 주택 임대차 법정 상한에 부가세 {formatPercent(VAT_RATE * 100, 0)}를 더한
          값입니다. 실제 복비는 이 안에서 낮출 수 있습니다. 이자는 넣은 금리로 계산합니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.brokerage]} />
      </div>
    </CalcShell>
  )
}
