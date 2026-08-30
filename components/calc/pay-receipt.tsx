"use client"

import type { ReactNode } from "react"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatKoreanUnit, formatSignedWon, formatWon } from "@/lib/format"
import type { QuitHealthResult, TakeHomeResult } from "@/lib/payroll"

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
  children,
}: {
  title: string
  headline: string | null
  caption?: string
  empty?: string
  copyValue?: string
  children?: ReactNode
}) {
  async function copy() {
    if (!copyValue) return
    await navigator.clipboard.writeText(copyValue)
    toast.success("숫자를 복사했어요")
  }

  return (
    <aside className="paper-rule rounded-2xl bg-card p-5 ring-1 ring-foreground/8 md:sticky md:top-20">
      <p className="text-sm text-muted-foreground">{title}</p>
      {headline ? (
        <>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular md:text-4xl">{headline}</p>
          {caption ? <p className="mt-1 text-sm text-muted-foreground">{caption}</p> : null}
          {children}
          {copyValue ? (
            <Button type="button" variant="outline" className="mt-5 h-10 w-full" onClick={copy}>
              <Copy className="size-4" />
              결과 복사
            </Button>
          ) : null}
        </>
      ) : (
        <p className="mt-6 text-sm leading-6 text-muted-foreground">{empty}</p>
      )}
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

  const youth = row.youthRelief
    ? [{ label: "청년감면(연)", value: formatWon(row.youthRelief) }]
    : []

  return (
    <Frame
      title="월 실수령"
      headline={formatWon(row.monthlyTakeHome)}
      caption={`연 ${formatWon(row.annualTakeHome)} · ${formatKoreanUnit(row.annualTakeHome)}`}
      copyValue={String(Math.round(row.monthlyTakeHome))}
    >
      <div className="mt-5 space-y-0 border-t border-dashed border-border pt-3">
        <Line label="4대보험(월)" value={formatWon(row.insurance.monthly)} />
        <Line label="세금(월)" value={formatWon(row.monthlyTax)} />
        {row.insurance.pensionCapped ? (
          <p className="pt-1 text-xs text-muted-foreground">국민연금 상한 · 월 659만 원 기준</p>
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
            { label: "근로소득공제", value: formatWon(row.earnedDeduction) },
            { label: "기본공제", value: formatWon(row.personDeduction) },
            { label: "과세표준", value: formatWon(row.taxableBase) },
            { label: "산출세액", value: formatWon(row.calculatedTax) },
            { label: "근로세액공제", value: formatWon(row.earnedCredit) },
            ...youth,
            { label: "소득세(연)", value: formatWon(row.incomeTax) },
            { label: "지방소득세(연)", value: formatWon(row.localTax) },
          ].map((item) => (
            <Line key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </details>
      <div className="mt-3 border-t border-dashed border-border pt-3">
        <Line label="세전 연봉" value={formatWon(row.annualGross)} />
        <Line label="세전 월급" value={formatWon(row.monthlyGross)} />
        <Line label="연소득" value={formatWon(row.annualTakeHome)} />
        <Line label="월소득" value={formatWon(row.monthlyTakeHome)} />
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
  const youth =
    now.youthRelief || next.youthRelief
      ? [
          {
            label: "청년감면(연)",
            now: formatWon(now.youthRelief),
            next: formatWon(next.youthRelief),
          },
        ]
      : []

  return (
    <Frame
      title="세후 연 차이"
      headline={formatSignedWon(Math.round(annualDelta))}
      caption={`${annualDelta >= 0 ? "제안이" : "지금 직장이"} 세후로 더 남습니다 · 월 ${formatSignedWon(Math.round(monthlyDelta))}`}
      copyValue={String(Math.round(annualDelta))}
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
          <p className="pt-1 text-xs text-muted-foreground">국민연금 상한 · 월 659만 원 기준</p>
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
            {
              label: "근로소득공제",
              now: formatWon(now.earnedDeduction),
              next: formatWon(next.earnedDeduction),
            },
            {
              label: "기본공제",
              now: formatWon(now.personDeduction),
              next: formatWon(next.personDeduction),
            },
            {
              label: "과세표준",
              now: formatWon(now.taxableBase),
              next: formatWon(next.taxableBase),
            },
            {
              label: "산출세액",
              now: formatWon(now.calculatedTax),
              next: formatWon(next.calculatedTax),
            },
            {
              label: "근로세액공제",
              now: formatWon(now.earnedCredit),
              next: formatWon(next.earnedCredit),
            },
            ...youth,
            {
              label: "소득세(연)",
              now: formatWon(now.incomeTax),
              next: formatWon(next.incomeTax),
            },
            {
              label: "지방소득세(연)",
              now: formatWon(now.localTax),
              next: formatWon(next.localTax),
            },
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
          label="연소득"
          now={formatWon(now.annualTakeHome)}
          next={formatWon(next.annualTakeHome)}
        />
        <CompareRow
          label="월소득"
          now={formatWon(now.monthlyTakeHome)}
          next={formatWon(next.monthlyTakeHome)}
          strong
        />
      </div>
    </Frame>
  )
}
