"use client"

import { useMemo, useState } from "react"
import { CheckRow } from "@/components/calc/check-row"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { PayOfferReceipt, PayTakeHomeReceipt } from "@/components/calc/pay-receipt"
import { manwonToWon } from "@/lib/format"
import {
  PAYROLL,
  calcOfferCompare,
  calcQuitHealth,
  calcTakeHome,
  type QuitHealthKind,
  type TakeHomeResult,
} from "@/lib/payroll"
import type { CalcItem } from "@/lib/catalog"

type YouthSide = "none" | "current" | "offer" | "both"

export function PayCompare({ item }: { item: CalcItem }) {
  const compare = item.slug !== "take-home"
  const [period, setPeriod] = useState<"year" | "month">("year")
  const [current, setCurrent] = useState("4000")
  const [offer, setOffer] = useState("4800")
  const [commute, setCommute] = useState("0")
  const [years, setYears] = useState("0")
  const [meal, setMeal] = useState(true)
  const [youth, setYouth] = useState<YouthSide>("none")
  const [quitKind, setQuitKind] = useState<QuitHealthKind>("voluntary")
  const [gapMonths, setGapMonths] = useState("1")

  const packed = useMemo(() => {
    const entered = manwonToWon(Number(current) || 0)
    const currentWon = !compare && period === "month" ? entered * 12 : entered
    const offerWon = manwonToWon(Number(offer) || 0)
    const commuteWon = manwonToWon(Number(commute) || 0)
    if (!compare) {
      return {
        now: calcTakeHome({
          annualGross: currentWon,
          mealExempt: meal,
          youthSme: youth === "current" || youth === "both",
        }),
        next: null as TakeHomeResult | null,
        commuteWon,
        annualDelta: null as number | null,
        monthlyDelta: null as number | null,
        severance: 0,
        quitHealth: null,
      }
    }
    const result = calcOfferCompare({
      currentAnnual: currentWon,
      offerAnnual: offerWon,
      mealExempt: meal,
      currentYouthSme: youth === "current" || youth === "both",
      offerYouthSme: youth === "offer" || youth === "both",
      offerCommuteMonthly: commuteWon,
      yearsOfService: Number(years) || 0,
    })
    const quitHealth = calcQuitHealth({
      taxableMonthly: result.current.taxableMonthly,
      workplaceHealth: result.current.insurance.health,
      workplaceLtc: result.current.insurance.longTermCare,
      kind: quitKind,
      gapMonths: Number(gapMonths) || 0,
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
  }, [compare, period, current, offer, commute, years, meal, youth, quitKind, gapMonths])

  const now = packed.now.annualGross > 0 ? packed.now : null
  const next = packed.next && packed.next.annualGross > 0 ? packed.next : null

  return (
    <CalcShell
      item={item}
      faq={
        <FaqList
          items={[
            {
              q: "청년감면은 뭔가요?",
              a: "중소기업 취업 청년 소득세 감면입니다. 소득세의 90%, 연 200만 원 한도입니다. 회사·나이·기간 요건은 직접 확인하세요.",
            },
            {
              q: "명세서와 왜 조금 다른가요?",
              a: "회사는 간이세액표로 원천징수하고, 여기는 소득세법 제47조·제59조와 본인 기본공제만 넣습니다. 부양가족·신용카드는 빠져 있습니다.",
            },
            {
              q: "퇴사 후 건보는 뭔가요?",
              a: "회사를 나오면 직장 건보가 끊깁니다. 임의계속가입은 퇴직 전 월급 기준으로 회사분까지 본인이 내고, 최대 36개월입니다. 지역가입 고지액은 소득에 집·전세 점수가 붙어야 나옵니다. 가족 직장 피부양자면 보험료가 없습니다.",
            },
            {
              q: "최사건보는 언제 보이나요?",
              a: "건강보험 근로자 부담이 월 상한(2026년 약 459만 원)에 닿으면 ‘상한’이 붙습니다. 국민연금은 월 659만 원 상한이라 그보다 낮은 연봉에서도 줄이 바뀝니다.",
            },
          ]}
        />
      }
      guide={
        <div className="space-y-4 text-foreground">
          <p className="font-medium">2026 근로자 부담</p>
          <p>
            국민연금 {PAYROLL.pensionEmployeeRate * 100}% (월 상한{" "}
            {PAYROLL.pensionCeil.toLocaleString("ko-KR")}원), 건강보험 {PAYROLL.healthEmployeeRate * 100}
            %, 장기요양 건보의 {PAYROLL.longTermCareOfHealth * 100}%, 고용보험{" "}
            {PAYROLL.employmentEmployeeRate * 100}%.
          </p>
        </div>
      }
      result={
        compare ? (
          <PayOfferReceipt
            now={now}
            next={next}
            commuteWon={packed.commuteWon}
            annualDelta={now && next ? packed.annualDelta : null}
            monthlyDelta={now && next ? packed.monthlyDelta : null}
            severance={packed.severance}
            quitHealth={now && next ? packed.quitHealth : null}
          />
        ) : (
          <PayTakeHomeReceipt row={now} />
        )
      }
    >
      <div className="space-y-5">
        {!compare ? (
          <ChoiceGroup
            label="입력 단위"
            value={period}
            onChange={setPeriod}
            options={[
              { value: "year", label: "연봉" },
              { value: "month", label: "월급" },
            ]}
          />
        ) : null}
        {compare ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField id="cur" label="지금 연봉" value={current} onChange={setCurrent} />
            <MoneyField id="off" label="이직 제안 연봉" value={offer} onChange={setOffer} />
          </div>
        ) : (
          <MoneyField
            id="cur"
            label={period === "month" ? "세전 월급" : "세전 연봉"}
            value={current}
            onChange={setCurrent}
          />
        )}
        {compare ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField
              id="commute"
              label="더 나가는 월 교통비"
              value={commute}
              onChange={setCommute}
            />
            <MoneyField id="years" label="지금 근속" unit="년" value={years} onChange={setYears} />
          </div>
        ) : null}
        <ChoiceGroup
          label="청년 중소기업 감면"
          value={youth}
          onChange={setYouth}
          options={
            compare
              ? [
                  { value: "none", label: "없음" },
                  { value: "current", label: "지금 직장" },
                  { value: "offer", label: "이직 제안" },
                  { value: "both", label: "둘 다" },
                ]
              : [
                  { value: "none", label: "없음" },
                  { value: "current", label: "적용" },
                ]
          }
        />
        {compare ? (
          <Hint>소득세 90%, 연 200만 원 한도. 이직하면 끊기거나 새로 생기는 경우가 많습니다.</Hint>
        ) : null}
        <CheckRow id="meal" checked={meal} onChange={setMeal}>
          식대 비과세 월 20만 원
        </CheckRow>
        {compare ? (
          <>
            <ChoiceGroup
              label="퇴사 후 건강보험"
              value={quitKind}
              onChange={setQuitKind}
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
              value={gapMonths}
              onChange={setGapMonths}
            />
            <Hint>
              임의계속은 퇴직 전 1년 이상, 나온 뒤 2개월 안에 신청합니다. 회사분이 본인에게 붙습니다.
              지역가입 고지액은 집·전세·소득 점수가 있어야 나옵니다. 여기서는 소득월액×7.19%(재산
              제외)만 보여 줍니다.
            </Hint>
          </>
        ) : null}
      </div>
    </CalcShell>
  )
}
