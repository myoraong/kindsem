"use client"

import { Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatKoreanUnit, formatWon } from "@/lib/format"

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
}: {
  title: string
  amount: number | null
  caption?: string
  rows: ReceiptRow[]
  empty: string
  kind?: "won" | "percent" | "months" | "days"
}) {
  const hasResult = amount !== null

  async function copy() {
    if (amount === null) return
    const text =
      kind === "percent" || kind === "months" || kind === "days"
        ? amount.toFixed(kind === "percent" ? 2 : 1)
        : String(Math.round(amount))
    await navigator.clipboard.writeText(text)
    toast.success("숫자를 복사했어요")
  }

  const headline =
    amount === null
      ? ""
      : kind === "percent"
        ? `${amount.toFixed(2)}%`
        : kind === "months"
          ? `${amount.toFixed(1)}개월`
          : kind === "days"
            ? `${amount.toFixed(amount % 1 === 0 ? 0 : 1)}일`
            : formatWon(Math.round(amount))

  return (
    <aside className="paper-rule rounded-2xl bg-card p-5 ring-1 ring-foreground/8 md:sticky md:top-20">
      <p className="text-sm text-muted-foreground">{title}</p>
      {hasResult ? (
        <>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular md:text-4xl">
            {headline}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {caption ??
              (kind === "won"
                ? formatKoreanUnit(amount)
                : kind === "months"
                  ? "세후 상승 기준"
                  : kind === "days"
                    ? "근로기준법 제60조"
                    : "연 기준 단순 수익률")}
          </p>
          <div className="mt-5 space-y-2.5 border-t border-dashed border-border pt-4">
            {rows.map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={row.mute ? "text-muted-foreground tabular" : "tabular"}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" className="mt-5 h-10 w-full" onClick={copy}>
            <Copy className="size-4" />
            결과 복사
          </Button>
        </>
      ) : (
        <p className="mt-6 text-sm leading-6 text-muted-foreground">{empty}</p>
      )}
    </aside>
  )
}
