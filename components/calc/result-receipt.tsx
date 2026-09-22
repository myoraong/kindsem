"use client"

import Link from "next/link"
import { ResultActions } from "@/components/calc/result-actions"
import { ResultDock } from "@/components/calc/result-dock"
import { useRememberRecentResult } from "@/components/calc/use-remember-result"
import { useResultFlash } from "@/components/calc/use-result-flash"
import { useResultTitle } from "@/components/calc/use-result-title"
import { buttonVariants } from "@/components/ui/button"
import { formatKoreanUnit, formatWon, kakaoCopyLine } from "@/lib/format"
import { cn } from "@/lib/utils"
import { RECEIPT_REFERENCE_NOTE } from "@/lib/receipt-note"

export type ReceiptRow = {
  label: string
  value: string
  mute?: boolean
}

export function ResultReceipt({
  title,
  amount,
  caption,
  rows,
  empty,
  kind = "won",
  headline,
  copyLine,
  copyNote,
  lawLine,
  next,
}: {
  title: string
  amount: number | null
  caption?: string
  rows: ReceiptRow[]
  empty: string
  kind?: "won" | "percent" | "months" | "days"
  /** 금액 서식 대신 이 문구를 큰 제목으로 씁니다. */
  headline?: string
  copyLine?: string
  copyNote?: string
  lawLine?: string
  /** 이 결과로 다음 계산기를 엽니다. */
  next?: { href: string; label: string; note?: string }
}) {
  const hasResult = amount !== null || Boolean(headline)

  const display =
    headline ??
    (amount === null
      ? ""
      : kind === "percent"
        ? `${amount.toFixed(2)}%`
        : kind === "months"
          ? `${amount.toFixed(1)}개월`
          : kind === "days"
            ? `${amount.toFixed(amount % 1 === 0 ? 0 : 1)}일`
            : formatWon(Math.round(amount)))

  const spoken =
    caption ??
    (kind === "won" && amount !== null
      ? formatKoreanUnit(amount)
      : kind === "months"
        ? "세후 상승 기준"
        : kind === "days"
          ? "근로기준법 제60조"
          : "연 기준 단순 수익률")
  const line =
    copyLine ??
    kakaoCopyLine(title, display, copyNote ?? (caption && caption.length <= 24 ? caption : undefined))
  const flash = useResultFlash(hasResult ? display : "")
  useResultTitle(hasResult ? display : "", title)
  useRememberRecentResult(hasResult ? display : "")

  return (
    <aside
      id="calc-result"
      className="paper-rule scroll-mt-24 rounded-2xl bg-card p-5 ring-1 ring-foreground/8 md:sticky md:top-20"
    >
      <p className="text-sm text-muted-foreground">{title}</p>
      {hasResult ? (
        <>
          <p
            aria-live="polite"
            aria-atomic="true"
            className={cn("mt-2 text-3xl font-semibold tracking-tight tabular md:text-4xl", flash && "result-flash")}
          >
            {display}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{spoken}</p>
          {next ? (
            <div className="mt-4">
              <Link
                href={next.href}
                data-next-calc
                className={cn(buttonVariants({ variant: "default" }), "h-11 w-full")}
              >
                {next.label}
              </Link>
              {next.note ? (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{next.note}</p>
              ) : null}
            </div>
          ) : null}
          <div className="mt-5 space-y-2.5 border-t border-dashed border-border pt-4">
            {rows.map((row, index) => (
              <div key={`${index}-${row.label}`} className="flex items-start justify-between gap-4 text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={row.mute ? "text-muted-foreground tabular" : "tabular"}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          {lawLine ? (
            <p className="mt-4 text-xs leading-5 text-muted-foreground">{lawLine}</p>
          ) : null}
          <p className={`${lawLine ? "mt-2" : "mt-4"} text-xs leading-5 text-muted-foreground`}>
            {RECEIPT_REFERENCE_NOTE}
          </p>
          <ResultActions line={line} />
        </>
      ) : (
        <p className="mt-6 text-sm leading-6 text-muted-foreground">{empty}</p>
      )}
      {hasResult ? <ResultDock title={title} display={display} caption={spoken} line={line} /> : null}
    </aside>
  )
}
