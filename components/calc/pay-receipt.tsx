"use client"

import type { ReactNode } from "react"
import { ResultActions } from "@/components/calc/result-actions"
import { ResultDock } from "@/components/calc/result-dock"
import { useResultFlash } from "@/components/calc/use-result-flash"
import { useResultTitle } from "@/components/calc/use-result-title"
import { formatKoreanUnit, formatSignedWon, formatWon, kakaoCopyLine } from "@/lib/format"
import { PAYROLL, type QuitHealthResult, type TakeHomeResult } from "@/lib/payroll"
import { paySlipNote, RECEIPT_REFERENCE_NOTE } from "@/lib/receipt-note"
import { cn } from "@/lib/utils"

function healthWon(row: TakeHomeResult) {
  return row.insurance.healthCapped
    ? `${formatWon(row.insurance.health)} 상한`
    : formatWon(row.insurance.health)
}

function CompareRow({
  label,
  now,
  next,
  strong,
}: {
  label: string
  now: string
  next: string
  strong?: boolean
}) {
  return (
    <div className="grid grid-cols-[minmax(5.5rem,0.95fr)_1fr_1fr] items-baseline gap-2 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right tabular">{now}</span>
      <span className={`text-right tabular ${strong ? "font-medium" : ""}`}>{next}</span>
    </div>
  )
}

function pairedTaxLines(now: TakeHomeResult, next: TakeHomeResult) {
  const left = taxLines(now)
  const right = taxLines(next)
  const byLabel = new Map(right.map((item) => [item.label, item.value]))
  const labels = [...left.map((item) => item.label), ...right.map((item) => item.label)]
  const unique = labels.filter((label, index) => labels.indexOf(label) === index)
  return unique.map((label) => ({
    label,
    now: left.find((item) => item.label === label)?.value ?? formatWon(0),
    next: byLabel.get(label) ?? formatWon(0),
  }))
}

function taxLines(row: TakeHomeResult) {
  if (row.taxMode === "withholding" && row.withholding) {
    const slip = row.withholding
    const youth = slip.youthMonthly
      ? [{ label: "청년감면(월)", value: formatWon(slip.youthMonthly) }]
      : []
    return [
      { label: "간이세액(월)", value: formatWon(slip.tableMonthly) },
      { label: "자녀공제", value: formatWon(slip.childCredit) },
      { label: "원천 비율", value: `${slip.ratePercent}%` },
      ...youth,
      { label: "소득세(월)", value: formatWon(slip.incomeMonthly) },
      { label: "지방소득세(월)", value: formatWon(slip.localMonthly) },
    ]
  }
  const youth = row.youthRelief
    ? [{ label: "청년감면(연)", value: formatWon(row.youthRelief) }]
    : []
  return [
    { label: "근로소득공제", value: formatWon(row.earnedDeduction) },
    { label: `기본공제 ${row.personCount}명`, value: formatWon(row.personDeduction) },
    { label: "과세표준", value: formatWon(row.taxableBase) },
    { label: "산출세액", value: formatWon(row.calculatedTax) },
    { label: "근로세액공제", value: formatWon(row.earnedCredit) },
    ...youth,
    { label: "소득세(연)", value: formatWon(row.incomeTax) },
    { label: "지방소득세(연)", value: formatWon(row.localTax) },
  ]
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular">{value}</span>
    </div>
  )
}

function Frame({
  title,
  headline,
  caption,
  empty,
  copyValue,
  note,
  children,
}: {
  title: string
  headline: string | null
  caption?: string
  empty?: string
  copyValue?: string
  note?: string
  children?: ReactNode
}) {
  const flash = useResultFlash(headline ?? "")
  useResultTitle(headline ?? "", title)

  return (
    <aside
      id="calc-result"
      className="paper-rule scroll-mt-24 rounded-2xl bg-card p-5 ring-1 ring-foreground/8 md:sticky md:top-20"
    >
      <p className="text-sm text-muted-foreground">{title}</p>
      {headline ? (
        <>
          <p
            aria-live="polite"
            aria-atomic="true"
            className={cn("mt-2 text-3xl font-semibold tracking-tight tabular md:text-4xl", flash && "result-flash")}
          >
            {headline}
          </p>
          {caption ? <p className="mt-1 text-sm text-muted-foreground">{caption}</p> : null}
          {children}
          <p className="mt-4 text-xs leading-5 text-muted-foreground">{note ?? paySlipNote("settlement")}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{RECEIPT_REFERENCE_NOTE}</p>
          {copyValue ? <ResultActions line={copyValue} /> : null}
        </>
      ) : (
        <p className="mt-6 text-sm leading-6 text-muted-foreground">{empty}</p>
      )}
      {headline && copyValue ? <ResultDock title={title} display={headline} line={copyValue} /> : null}
    </aside>
  )
}

export function PayTakeHomeReceipt({ row }: { row: TakeHomeResult | null }) {
  if (!row) {
    return (
      <Frame
        title="월 실수령"
        headline={null}
        empty="세전 연봉이나 월급을 넣으면 실수령이 나옵니다."
      />
    )
  }

  return (
    <Frame
      title={row.taxMode === "withholding" ? "명세서 월 실수령" : "월 실수령"}
      headline={formatWon(row.monthlyTakeHome)}
      caption={`연 ${formatWon(row.annualTakeHome)} · ${formatKoreanUnit(row.annualTakeHome)}`}
      copyValue={kakaoCopyLine("실수령", formatWon(row.monthlyTakeHome), "4대보험·세금 공제")}
      note={paySlipNote(row.taxMode)}
    >
      <div className="mt-5 space-y-0 border-t border-dashed border-border pt-3">
        <Line label="4대보험(월)" value={formatWon(row.insurance.monthly)} />
        <Line label="세금(월)" value={formatWon(row.monthlyTax)} />
        <Line
          label="공제 합(월)"
          value={formatWon(row.insurance.monthly + row.monthlyTax)}
        />
        {row.insurance.pensionCapped ? (
          <p className="pt-1 text-xs text-muted-foreground">
            국민연금 상한 · 월 {formatKoreanUnit(PAYROLL.pensionCeil)} 기준
          </p>
        ) : null}
        {row.insurance.healthCapped ? (
          <p className="pt-1 text-xs text-muted-foreground">건강보험 근로자 부담 상한</p>
        ) : null}
      </div>
      <details className="mt-3 rounded-xl bg-secondary/60 px-3 py-2">
        <summary className="cursor-pointer text-sm font-medium">보험·세금 내역</summary>
        <div className="mt-1 divide-y divide-border/60">
          {[
            { label: "국민연금(월)", value: formatWon(row.insurance.pension) },
            { label: "건강보험(월)", value: healthWon(row) },
            { label: "장기요양(월)", value: formatWon(row.insurance.longTermCare) },
            { label: "고용보험(월)", value: formatWon(row.insurance.employment) },
            ...taxLines(row),
          ].map((item) => (
            <Line key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </details>
      <div className="mt-3 border-t border-dashed border-border pt-3">
        <Line label="세전 연봉" value={formatWon(row.annualGross)} />
        <Line label="세전 월급" value={formatWon(row.monthlyGross)} />
        <Line label="세후 연" value={formatWon(row.annualTakeHome)} />
        <Line label="세후 월" value={formatWon(row.monthlyTakeHome)} />
      </div>
    </Frame>
  )
}

export function PayOfferReceipt({
  now,
  next,
  commuteWon,
  annualDelta,
  monthlyDelta,
  severance,
  quitHealth,
}: {
  now: TakeHomeResult | null
  next: TakeHomeResult | null
  commuteWon: number
  annualDelta: number | null
  monthlyDelta: number | null
  severance: number
  quitHealth: QuitHealthResult | null
}) {
  if (!now || !next || annualDelta == null || monthlyDelta == null) {
    return (
      <Frame
        title="세후 연 차이"
        headline={null}
        empty="지금 연봉과 제안을 넣으면 세후 차이가 나옵니다."
      />
    )
  }

  const feltMonthlyNow = now.monthlyTakeHome
  const feltMonthlyNext = next.monthlyTakeHome - commuteWon
  return (
    <Frame
      title={now.taxMode === "withholding" ? "명세서 세후 차이" : "세후 연 차이"}
      headline={formatSignedWon(Math.round(annualDelta))}
      caption={`${annualDelta >= 0 ? "제안이" : "지금 직장이"} 세후로 더 남습니다 · 월 ${formatSignedWon(Math.round(monthlyDelta))}`}
      copyValue={kakaoCopyLine("세후 연 차이", formatSignedWon(Math.round(annualDelta)))}
      note={paySlipNote(now.taxMode)}
    >
      <div className="mt-5 border-t border-dashed border-border pt-3">
        <div className="grid grid-cols-[minmax(5.5rem,0.95fr)_1fr_1fr] gap-2 text-xs text-muted-foreground">
          <span />
          <span className="text-right">지금</span>
          <span className="text-right">제안</span>
        </div>
        <CompareRow
          label="월 실수령"
          now={formatWon(now.monthlyTakeHome)}
          next={formatWon(next.monthlyTakeHome)}
          strong
        />
        <CompareRow
          label="연 실수령"
          now={formatWon(now.annualTakeHome)}
          next={formatWon(next.annualTakeHome)}
        />
        <CompareRow
          label="교통비(월)"
          now={formatWon(0)}
          next={commuteWon ? `+${formatWon(commuteWon)}` : formatWon(0)}
        />
        {commuteWon ? (
          <CompareRow
            label="손에 남는 월"
            now={formatWon(feltMonthlyNow)}
            next={formatWon(feltMonthlyNext)}
            strong
          />
        ) : null}
        {severance ? (
          <p className="pt-2 text-xs leading-5 text-muted-foreground">
            지금 월급×근속 {formatWon(severance)} · 근로기준법 평균임금이 아닙니다
          </p>
        ) : null}
        {quitHealth ? (
          <div className="mt-3 space-y-0 border-t border-dashed border-border pt-3">
            <p className="pb-1 text-xs text-muted-foreground">퇴사 후 건강보험 · {quitHealth.label}</p>
            <Line label="직장 때 본인" value={formatWon(quitHealth.workplaceMonthly)} />
            {quitHealth.kind === "regional" ? (
              <Line
                label="소득월액×요율(재산 제외)"
                value={formatWon(quitHealth.quitMonthly)}
              />
            ) : (
              <Line label="퇴사 후 월" value={formatWon(quitHealth.quitMonthly)} />
            )}
            {quitHealth.gapMonths > 0 ? (
              <Line
                label={
                  quitHealth.kind === "regional"
                    ? `공백 ${quitHealth.gapMonths}개월(소득정률)`
                    : `공백 ${quitHealth.gapMonths}개월`
                }
                value={formatWon(quitHealth.gapTotal)}
              />
            ) : null}
            {quitHealth.kind === "regional" ? (
              <p className="pt-1 text-xs leading-5 text-muted-foreground">
                집·전세·소득 점수가 있어야 공단 고지가 나옵니다. 이 금액은 고지액이 아닙니다.
              </p>
            ) : null}
          </div>
        ) : null}
        {now.insurance.pensionCapped || next.insurance.pensionCapped ? (
          <p className="pt-1 text-xs text-muted-foreground">
            국민연금 상한 · 월 {formatKoreanUnit(PAYROLL.pensionCeil)} 기준
          </p>
        ) : null}
        {now.insurance.healthCapped || next.insurance.healthCapped ? (
          <p className="pt-1 text-xs text-muted-foreground">건강보험 근로자 부담 상한</p>
        ) : null}
      </div>
      <details className="mt-3 rounded-xl bg-secondary/60 px-3 py-2">
        <summary className="cursor-pointer text-sm font-medium">보험·세금 내역</summary>
        <div className="mt-1">
          <div className="grid grid-cols-[minmax(5.5rem,0.95fr)_1fr_1fr] gap-2 text-xs text-muted-foreground">
            <span />
            <span className="text-right">지금</span>
            <span className="text-right">제안</span>
          </div>
          {[
            {
              label: "국민연금(월)",
              now: formatWon(now.insurance.pension),
              next: formatWon(next.insurance.pension),
            },
            {
              label: "건강보험(월)",
              now: healthWon(now),
              next: healthWon(next),
            },
            {
              label: "장기요양(월)",
              now: formatWon(now.insurance.longTermCare),
              next: formatWon(next.insurance.longTermCare),
            },
            {
              label: "고용보험(월)",
              now: formatWon(now.insurance.employment),
              next: formatWon(next.insurance.employment),
            },
            ...pairedTaxLines(now, next),
          ].map((item) => (
            <CompareRow key={item.label} label={item.label} now={item.now} next={item.next} />
          ))}
        </div>
      </details>
      <div className="mt-3 border-t border-dashed border-border pt-3">
        <div className="grid grid-cols-[minmax(5.5rem,0.95fr)_1fr_1fr] gap-2 text-xs text-muted-foreground">
          <span />
          <span className="text-right">지금</span>
          <span className="text-right">제안</span>
        </div>
        <CompareRow
          label="세전 연봉"
          now={formatWon(now.annualGross)}
          next={formatWon(next.annualGross)}
        />
        <CompareRow
          label="세전 월급"
          now={formatWon(now.monthlyGross)}
          next={formatWon(next.monthlyGross)}
        />
        <CompareRow
          label="세후 연"
          now={formatWon(now.annualTakeHome)}
          next={formatWon(next.annualTakeHome)}
        />
        <CompareRow
          label="세후 월"
          now={formatWon(now.monthlyTakeHome)}
          next={formatWon(next.monthlyTakeHome)}
          strong
        />
      </div>
    </Frame>
  )
}
