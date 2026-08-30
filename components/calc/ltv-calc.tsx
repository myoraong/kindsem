"use client"

import { useMemo, useState } from "react"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { calculateLtv, type LtvBorrower, type LtvZone } from "@/lib/ltv"
import { formatPercent, formatWon, manwonToWon } from "@/lib/format"
import { LTV_POLICY } from "@/lib/policy.generated"
import type { CalcItem } from "@/lib/catalog"

const LTV_FAQ = [
  {
    q: "LTV란 무엇인가요?",
    a: "LTV(Loan-to-Value)는 담보가치 대비 대출금 비율입니다. 담보 10억에 5억을 빌리면 LTV 50%입니다. 은행은 KB시세, 부동산원 시세, 감정가 중 낮은 금액을 담보가치로 봅니다.",
  },
  {
    q: "규제지역 한도는 어떻게 다른가요?",
    a: `은행업감독규정 별표 6 일반 기준은 비규제 ${Math.round(LTV_POLICY.unregulated * 100)}%, 조정대상·투기·투기과열 ${Math.round(LTV_POLICY.regulated * 100)}%입니다.`,
  },
  {
    q: "생애최초는 더 나오나요?",
    a: `생애최초는 ${Math.round(LTV_POLICY.firstTime * 100)}%까지 보되, 대출금은 ${Math.round(LTV_POLICY.firstTimeCap / 100_000_000)}억 원을 넘지 못합니다. 서민·실수요자 우대와 오피스텔 등 비주택은 이 계산에 넣지 않았으니 은행에서 한 번 더 확인하세요.`,
  },
]

export function LtvCalc({ item }: { item: CalcItem }) {
  const [zone, setZone] = useState<LtvZone>("unregulated")
  const [borrower, setBorrower] = useState<LtvBorrower>("general")
  const [collateral, setCollateral] = useState("80000")
  const [desired, setDesired] = useState("40000")

  const result = useMemo(() => {
    const collateralWon = manwonToWon(Number(collateral) || 0)
    const desiredWon = manwonToWon(Number(desired) || 0)
    return calculateLtv({
      collateralWon,
      desiredWon,
      zone,
      borrower,
    })
  }, [collateral, desired, zone, borrower])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={LTV_FAQ} />}
      guide={
        <div className="space-y-4 text-foreground">
          <p className="font-medium text-foreground">일반 LTV</p>
          <p>
            비규제 {Math.round(LTV_POLICY.unregulated * 100)}%, 조정대상지역·투기지역·투기과열지구{" "}
            {Math.round(LTV_POLICY.regulated * 100)}%입니다. 은행업감독규정 별표 6 기준입니다.
          </p>
          <p className="font-medium text-foreground">생애최초 한도</p>
          <p>
            생애최초는 {Math.round(LTV_POLICY.firstTime * 100)}%까지, 대출금은{" "}
            {Math.round(LTV_POLICY.firstTimeCap / 100_000_000)}억 원을 넘지 못합니다. 별표에 없는
            집값 구간 절대한도는 넣지 않습니다.
          </p>
          <p className="font-medium text-foreground">차주</p>
          <p>
            미처분 1주택 추가구입은 주택구입 주담대가 막혀 있습니다. 처분조건부는 일반 한도로 보고,
            실제 약정은 은행이 정합니다.
          </p>
        </div>
      }
      result={
        <ResultReceipt
          title={result?.banned ? "대출 한도" : "최대 한도"}
          amount={result ? result.maxLoan : null}
          caption={
            result?.banned
              ? result.note
              : result
                ? `${formatPercent(result.rate * 100, 0)} · ${result.note}`
                : undefined
          }
          rows={
            result
              ? [
                  { label: "LTV 비율", value: formatPercent(result.rate * 100, 0) },
                  { label: "비율 한도", value: formatWon(result.maxByRate) },
                  ...(result.firstTimeCap != null
                    ? [{ label: "생애최초 대출 한도", value: formatWon(result.firstTimeCap) }]
                    : []),
                  {
                    label: "희망 LTV",
                    value:
                      result.desiredLtv === null ? "—" : formatPercent(result.desiredLtv, 1),
                  },
                  {
                    label: "희망 대출",
                    value:
                      result.desiredLtv === null
                        ? "—"
                        : result.banned
                          ? "불가"
                          : result.allowed
                            ? "한도 안"
                            : "한도 초과",
                  },
                ]
              : []
          }
          empty="담보가치만 넣으면 한도가 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="규제 지역"
          value={zone}
          onChange={setZone}
          options={[
            { value: "unregulated", label: `비규제(${Math.round(LTV_POLICY.unregulated * 100)}%)` },
            { value: "adjusted", label: `조정대상(${Math.round(LTV_POLICY.regulated * 100)}%)` },
            { value: "speculation", label: `투기·투기과열(${Math.round(LTV_POLICY.regulated * 100)}%)` },
          ]}
        />
        <Hint>
          {zone === "unregulated"
            ? `비규제 일반은 ${Math.round(LTV_POLICY.unregulated * 100)}%입니다.`
            : "조정대상과 투기·투기과열은 은행업감독규정 일반 한도가 같습니다."}
        </Hint>
        <ChoiceGroup
          label="차주"
          value={borrower}
          onChange={setBorrower}
          options={[
            { value: "general", label: "일반" },
            { value: "first", label: "생애최초" },
            { value: "conditional", label: "처분조건부" },
            { value: "extra", label: "추가구입(미처분)" },
          ]}
        />
        <Hint>
          {borrower === "extra"
            ? "지금 집을 팔지 않고 한 채를 더 사면, 주택구입 주담대는 안 됩니다."
            : borrower === "first"
              ? `생애최초는 ${Math.round(LTV_POLICY.firstTime * 100)}%까지, 대출금 ${Math.round(LTV_POLICY.firstTimeCap / 100_000_000)}억 원 한도입니다. 서민·실수요자 우대는 자동으로 넣지 않습니다.`
              : borrower === "conditional"
                ? "기존 집을 팔기로 하고 사는 경우입니다. 한도는 일반과 같고, 처분 기한은 은행 약정입니다."
                : "일반 차주 기준입니다. 오피스텔 등 비주택 70% 한도는 따로 보지 않습니다."}
        </Hint>
        <MoneyField
          id="col"
          label="담보가치"
          hint="KB시세·감정가"
          value={collateral}
          onChange={setCollateral}
        />
        <MoneyField
          id="want"
          label="대출 희망액"
          hint="선택"
          value={desired}
          onChange={setDesired}
        />
      </div>
    </CalcShell>
  )
}
