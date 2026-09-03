"use client"

import { Label } from "@/components/ui/label"
import { formatGroupedInput, formatKoreanUnit, manwonToWon } from "@/lib/format"

export function MoneyField({
  id,
  label,
  hint,
  unit = "만원",
  value,
  onChange,
  placeholder = "0",
}: {
  id: string
  label: string
  hint?: string
  unit?: "만원" | "원" | "%" | "명" | "개월" | "년" | "시간" | "일" | "시간/주" | "일/주" | "달러" | "원/달러" | "cc"
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const numeric = Number(value.replace(/,/g, ""))
  const preview =
    unit === "만원" && Number.isFinite(numeric) && value !== ""
      ? formatKoreanUnit(manwonToWon(numeric))
      : null

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {preview ? (
          <span className="text-xs text-muted-foreground">{preview}</span>
        ) : hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      <div className="relative">
        <input
          id={id}
          inputMode="decimal"
          value={formatGroupedInput(value)}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ""))}
          className="h-12 w-full rounded-xl border border-input bg-transparent pr-14 pl-3 text-lg tabular outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  )
}
