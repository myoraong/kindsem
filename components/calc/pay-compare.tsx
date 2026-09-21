"use client"

import { useMemo } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CheckRow } from "@/components/calc/check-row"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { PaySiblingHint } from "@/components/calc/sibling-hint"
import { MoneyField } from "@/components/calc/money-field"
import { PayOfferReceipt, PayTakeHomeReceipt } from "@/components/calc/pay-receipt"
import { formatKoreanUnit, formatRatePercent, formatWon, manwonToWon } from "@/lib/format"
import {
  PAYROLL,
  calcOfferCompare,
  calcQuitHealth,
  calcTakeHome,
  convertPayEntry,
  type PayPeriod,
  type PayTaxMode,
  type QuitHealthKind,
} from "@/lib/payroll"
import { CHILD_CREDIT_EXTRA, CHILD_CREDIT_ONE, CHILD_CREDIT_TWO } from "@/lib/simplified-wage-tax"
import type { CalcItem } from "@/lib/catalog"
import { useCalcPersist } from "@/lib/use-calc-persist"

type YouthSide = "none" | "current" | "offer" | "both"

const DEPENDENT_OPTIONS = [
  { value: "0", label: "없음" },
  { value: "1", label: "1명" },
  { value: "2", label: "2명" },
  { value: "3", label: "3명" },
  { value: "4", label: "4명" },
  { value: "5", label: "5명+" },
] as const

function payFaq() {
  return (
    <FaqList
      items={[
        {
          q: "청년감면은 뭔가요?",
          a: "중소기업 취업 청년 소득세 감면입니다. 소득세의 90%, 연 200만 원 한도입니다. 회사·나이·기간 요건은 직접 확인하세요.",
        },
        {
          q: "명세서와 왜 조금 다른가요?",
          a: "연말정산 월평균은 소득세법 제47조·제50조·제59조와 부양가족×150만 원만 넣고 1년 세를 12로 나눕니다. 이번 달 명세서를 고르면 간이세액표를 봅니다. 신용카드·보험료는 어느 쪽이든 넣지 않습니다.",
        },
        {
          q: "퇴사 후 건보는 뭔가요?",
          a: "회사를 나오면 직장 건보가 끊깁니다. 임의계속가입은 퇴직 전 월급 기준으로 회사분까지 본인이 내고, 최대 36개월입니다. 지역가입 고지액은 소득에 집·전세 점수가 붙어야 나옵니다. 가족 직장 피부양자면 보험료가 없습니다.",
        },
        {
          q: "상한은 언제 보이나요?",
          a: `건강보험 근로자 부담이 월 상한(${formatWon(PAYROLL.healthEmployeeCap)})에 닿으면 ‘상한’이 붙습니다. 국민연금은 월 ${formatKoreanUnit(PAYROLL.pensionCeil)} 상한이라 그보다 낮은 연봉에서도 줄이 바뀝니다.`,
        },
      ]}
    />
  )
}

function payGuide() {
  return (
    <div className="space-y-2 text-foreground">
      <p>
        <span className="font-medium text-foreground">2026 근로자 부담</span> : 국민연금{" "}
        {formatRatePercent(PAYROLL.pensionEmployeeRate)} (월 상한{" "}
        {PAYROLL.pensionCeil.toLocaleString("ko-KR")}원), 건강보험{" "}
        {formatRatePercent(PAYROLL.healthEmployeeRate)}, 장기요양 건보의{" "}
        {formatRatePercent(PAYROLL.longTermCareOfHealth)}, 고용보험{" "}
        {formatRatePercent(PAYROLL.employmentEmployeeRate)}.
      </p>
    </div>
  )
}

const TAX_MODE_OPTIONS = [
  { value: "settlement", label: "연말정산 월평균" },
  { value: "withholding", label: "이번 달 명세서" },
] as const

const CHILD_OPTIONS = [
  { value: "0", label: "없음" },
  { value: "1", label: "1명" },
  { value: "2", label: "2명" },
  { value: "3", label: "3명" },
  { value: "4", label: "4명" },
  { value: "5", label: "5명" },
] as const

const WITHHOLD_RATE_OPTIONS = [
  { value: "80", label: "80%" },
  { value: "100", label: "100%" },
  { value: "120", label: "120%" },
] as const

function DependentsField({
  value,
  onChange,
  taxMode,
}: {
  value: string
  onChange: (value: string) => void
  taxMode: PayTaxMode
}) {
  return (
    <div className="space-y-2">
      <ChoiceGroup label="부양가족" value={value} onChange={onChange} options={[...DEPENDENT_OPTIONS]} />
      <Hint>
        {taxMode === "withholding"
          ? "본인을 뺀 공제대상가족입니다. 배우자·자녀·부모가 표의 가족 수에 들어갑니다."
          : `본인 말고 기본공제 대상(배우자·자녀 등)입니다. 1명당 연 ${formatKoreanUnit(PAYROLL.basicPersonDeduction)}입니다. 신용카드·보험료는 넣지 않습니다.`}
      </Hint>
    </div>
  )
}

function TaxBasisFields({
  taxMode,
  onTaxMode,
  children,
  onChildren,
  rate,
  onRate,
}: {
  taxMode: PayTaxMode
  onTaxMode: (value: PayTaxMode) => void
  children: string
  onChildren: (value: string) => void
  rate: string
  onRate: (value: string) => void
}) {
  return (
    <>
      <ChoiceGroup
        label="세금 기준"
        value={taxMode}
        onChange={onTaxMode}
        options={[...TAX_MODE_OPTIONS]}
      />
      <Hint>
        {taxMode === "withholding"
          ? "소득세법 시행령 별표 2(2026.2.27.)입니다. 자녀 세액과 원천 비율을 적용한 뒤 10원 미만을 버립니다."
          : "1년 소득세를 12로 나눈 월평균입니다. 회사 명세서와 맞추려면 이번 달 명세서를 고르세요."}
      </Hint>
      {taxMode === "withholding" ? (
        <>
          <ChoiceGroup
            label="8~20세 자녀"
            value={children}
            onChange={onChildren}
            options={[...CHILD_OPTIONS]}
          />
          <Hint>
            표에서 따로 뺍니다. 1명 {formatWon(CHILD_CREDIT_ONE)}, 2명 {formatWon(CHILD_CREDIT_TWO)},
            3명부터 1명당 {formatWon(CHILD_CREDIT_EXTRA)}입니다. 없으면 그대로 둡니다.
          </Hint>
          <ChoiceGroup
            label="원천징수 비율"
            value={rate}
            onChange={onRate}
            options={[...WITHHOLD_RATE_OPTIONS]}
          />
          <Hint>회사 원천징수 신고가 80%·100%·120% 중 무엇인지는 급여 담당에게 있습니다. 모르면 100%입니다.</Hint>
        </>
      ) : null}
    </>
  )
}

export function PayCompare({ item }: { item: CalcItem }) {
  if (item.slug !== "take-home") return <OfferCompareForm item={item} />
  return <TakeHomeForm item={item} />
}

function TakeHomeForm({ item }: { item: CalcItem }) {
  const [v, set, setMany] = useCalcPersist(item.slug, {
    period: "year" as PayPeriod,
    current: "4000",
    mealExempt: false,
    youth: "none",
    dependents: "0",
    taxMode: "settlement" as PayTaxMode,
    children: "0",
    withholdRate: "100",
  })

  const packed = useMemo(() => {
    const entered = manwonToWon(Number(v.current) || 0)
    const currentWon = v.period === "month" ? entered * 12 : entered
    return calcTakeHome({
      annualGross: currentWon,
      mealExempt: v.mealExempt,
      youthSme: v.youth === "current" || v.youth === "both",
      dependents: Number(v.dependents) || 0,
      taxMode: v.taxMode,
      children: Number(v.children) || 0,
      withholdingRate: Number(v.withholdRate) || 100,
    })
  }, [v.period, v.current, v.mealExempt, v.youth, v.dependents, v.taxMode, v.children, v.withholdRate])

  const now = packed.annualGross > 0 ? packed : null

  return (
    <CalcShell item={item} faq={payFaq()} guide={payGuide()} result={<PayTakeHomeReceipt row={now} />}>
      <div className="space-y-5">
        <PaySiblingHint here="take-home" />
        <TaxBasisFields
          taxMode={v.taxMode}
          onTaxMode={(value) => set("taxMode", value)}
          children={v.children}
          onChildren={(value) => set("children", value)}
          rate={v.withholdRate}
          onRate={(value) => set("withholdRate", value)}
        />
        <ChoiceGroup
          label="입력 단위"
          value={v.period}
          onChange={(value) => {
            setMany({
              period: value,
              current: convertPayEntry(v.current, v.period, value),
            })
          }}
          options={[
            { value: "year", label: "연봉" },
            { value: "month", label: "월급" },
          ]}
        />
        <div className="space-y-2">
          <MoneyField
            id="cur"
            label={v.period === "month" ? "세전 월급" : "세전 연봉"}
            value={v.current}
            onChange={(value) => set("current", value)}
          />
          <AmountChips
            options={
              v.period === "month"
                ? [
                    { label: "250만", value: "250" },
                    { label: "300만", value: "300" },
                    { label: "350만", value: "350" },
                    { label: "400만", value: "400" },
                    { label: "500만", value: "500" },
                  ]
                : [
                    { label: "3천만", value: "3000" },
                    { label: "4천만", value: "4000" },
                    { label: "5천만", value: "5000" },
                    { label: "6천만", value: "6000" },
                    { label: "8천만", value: "8000" },
                  ]
            }
            onPick={(value) => set("current", value)}
          />
        </div>
        <DependentsField
          value={v.dependents}
          onChange={(value) => set("dependents", value)}
          taxMode={v.taxMode}
        />
        <ChoiceGroup
          label="청년 중소기업 감면"
          value={v.youth}
          onChange={(value) => set("youth", value)}
          options={[
            { value: "none", label: "없음" },
            { value: "current", label: "적용" },
          ]}
        />
        <CheckRow id="meal" checked={v.mealExempt} onChange={(value) => set("mealExempt", value)}>
          식대 비과세 월 {formatWon(PAYROLL.mealExemptMonthly)}
        </CheckRow>
        <Hint>해당하면 켜세요. 기본은 꺼 둡니다. 식대가 없으면 명세서보다 실수령이 커집니다.</Hint>
      </div>
    </CalcShell>
  )
}

function OfferCompareForm({ item }: { item: CalcItem }) {
  const [v, set, setMany] = useCalcPersist(item.slug, {
    period: "year" as PayPeriod,
    current: "4000",
    offer: "4800",
    commute: "",
    years: "",
    mealExempt: false,
    youth: "none" as YouthSide,
    quitKind: "voluntary" as QuitHealthKind,
    gapMonths: "1",
    dependents: "0",
    taxMode: "settlement" as PayTaxMode,
    children: "0",
    withholdRate: "100",
  })

  const packed = useMemo(() => {
    const toAnnual = (raw: string) => {
      const entered = manwonToWon(Number(raw) || 0)
      return v.period === "month" ? entered * 12 : entered
    }
    const currentWon = toAnnual(v.current)
    const offerWon = toAnnual(v.offer)
    const commuteWon = manwonToWon(Number(v.commute) || 0)
    const result = calcOfferCompare({
      currentAnnual: currentWon,
      offerAnnual: offerWon,
      mealExempt: v.mealExempt,
      currentYouthSme: v.youth === "current" || v.youth === "both",
      offerYouthSme: v.youth === "offer" || v.youth === "both",
      offerCommuteMonthly: commuteWon,
      yearsOfService: Number(v.years) || 0,
      dependents: Number(v.dependents) || 0,
      taxMode: v.taxMode,
      children: Number(v.children) || 0,
      withholdingRate: Number(v.withholdRate) || 100,
    })
    const quitHealth = calcQuitHealth({
      taxableMonthly: result.current.taxableMonthly,
      workplaceHealth: result.current.insurance.health,
      workplaceLtc: result.current.insurance.longTermCare,
      kind: v.quitKind,
      gapMonths: Number(v.gapMonths) || 0,
    })
    return {
      now: result.current,
      next: result.offer,
      commuteWon,
      annualDelta: result.annualDeltaAfterCommute,
      monthlyDelta: result.monthlyDeltaAfterCommute,
      severance: result.severance,
      quitHealth,
    }
  }, [v])

  const now = packed.now.annualGross > 0 ? packed.now : null
  const next = packed.next.annualGross > 0 ? packed.next : null

  return (
    <CalcShell
      item={item}
      faq={payFaq()}
      guide={payGuide()}
      result={
        <PayOfferReceipt
          now={now}
          next={next}
          commuteWon={packed.commuteWon}
          annualDelta={now && next ? packed.annualDelta : null}
          monthlyDelta={now && next ? packed.monthlyDelta : null}
          severance={packed.severance}
          quitHealth={now && next ? packed.quitHealth : null}
        />
      }
    >
      <div className="space-y-5">
        <PaySiblingHint here="offer-compare" />
        <TaxBasisFields
          taxMode={v.taxMode}
          onTaxMode={(value) => set("taxMode", value)}
          children={v.children}
          onChildren={(value) => set("children", value)}
          rate={v.withholdRate}
          onRate={(value) => set("withholdRate", value)}
        />
        <ChoiceGroup
          label="입력 단위"
          value={v.period}
          onChange={(value) => {
            setMany({
              period: value,
              current: convertPayEntry(v.current, v.period, value),
              offer: convertPayEntry(v.offer, v.period, value),
            })
          }}
          options={[
            { value: "year", label: "연봉" },
            { value: "month", label: "월급" },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <MoneyField
              id="cur"
              label={v.period === "month" ? "지금 월급" : "지금 연봉"}
              value={v.current}
              onChange={(value) => set("current", value)}
            />
            <AmountChips
              options={
                v.period === "month"
                  ? [
                      { label: "250만", value: "250" },
                      { label: "300만", value: "300" },
                      { label: "350만", value: "350" },
                      { label: "400만", value: "400" },
                      { label: "500만", value: "500" },
                    ]
                  : [
                      { label: "3천만", value: "3000" },
                      { label: "4천만", value: "4000" },
                      { label: "5천만", value: "5000" },
                      { label: "6천만", value: "6000" },
                      { label: "8천만", value: "8000" },
                    ]
              }
              onPick={(value) => set("current", value)}
            />
          </div>
          <div className="space-y-2">
            <MoneyField
              id="off"
              label={v.period === "month" ? "이직 제안 월급" : "이직 제안 연봉"}
              value={v.offer}
              onChange={(value) => set("offer", value)}
            />
            <AmountChips
              options={
                v.period === "month"
                  ? [
                      { label: "280만", value: "280" },
                      { label: "350만", value: "350" },
                      { label: "400만", value: "400" },
                      { label: "500만", value: "500" },
                    ]
                  : [
                      { label: "4천만", value: "4000" },
                      { label: "4,800만", value: "4800" },
                      { label: "6천만", value: "6000" },
                      { label: "8천만", value: "8000" },
                    ]
              }
              onPick={(value) => set("offer", value)}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField
            id="commute"
            label="더 나가는 월 교통비"
            value={v.commute}
            onChange={(value) => set("commute", value)}
            placeholder="없음"
          />
          <MoneyField
            id="years"
            label="지금 근속"
            unit="년"
            value={v.years}
            onChange={(value) => set("years", value)}
            placeholder="없음"
          />
        </div>
        <DependentsField
          value={v.dependents}
          onChange={(value) => set("dependents", value)}
          taxMode={v.taxMode}
        />
        <ChoiceGroup
          label="청년 중소기업 감면"
          value={v.youth}
          onChange={(value) => set("youth", value)}
          options={[
            { value: "none", label: "없음" },
            { value: "current", label: "지금 직장" },
            { value: "offer", label: "이직 제안" },
            { value: "both", label: "둘 다" },
          ]}
        />
        <Hint>소득세 90%, 연 200만 원 한도. 이직하면 끊기거나 새로 생기는 경우가 많습니다.</Hint>
        <CheckRow id="meal" checked={v.mealExempt} onChange={(value) => set("mealExempt", value)}>
          식대 비과세 월 {formatWon(PAYROLL.mealExemptMonthly)}
        </CheckRow>
        <Hint>해당하면 켜세요. 기본은 꺼 둡니다. 식대가 없으면 명세서보다 실수령이 커집니다.</Hint>
        <ChoiceGroup
          label="퇴사 후 건강보험"
          value={v.quitKind}
          onChange={(value) => set("quitKind", value)}
          options={[
            { value: "voluntary", label: "임의계속" },
            { value: "regional", label: "지역(소득정률)" },
            { value: "dependent", label: "피부양자" },
          ]}
        />
        <MoneyField
          id="gap"
          label="다음 직장까지 공백"
          unit="개월"
          value={v.gapMonths}
          onChange={(value) => set("gapMonths", value)}
        />
        <Hint>
          임의계속은 퇴직 전 1년 이상, 나온 뒤 2개월 안에 신청합니다. 회사분이 본인에게 붙습니다.
          지역가입 고지액은 집·전세·소득 점수가 있어야 나옵니다. 여기서는 소득월액×7.19%(재산
          제외)만 보여 줍니다.
        </Hint>
      </div>
    </CalcShell>
  )
}
