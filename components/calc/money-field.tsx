"use client"

import { useLayoutEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import {
  caretIndexAfterGroup,
  formatGroupedInput,
  formatKoreanUnit,
  formatPlain,
  manwonIfTypedAsWon,
  manwonToWon,
} from "@/lib/format"

export function MoneyField({
  id,
  label,
  hint,
  unit = "만원",
  value,
  onChange,
  placeholder = "",
}: {
  id: string
  label: string
  hint?: string
  unit?: "만원" | "원" | "%" | "명" | "개월" | "년" | "세" | "시간" | "일" | "시간/주" | "일/주" | "달러" | "원/달러" | "cc" | "평" | "㎡"
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingDigits = useRef<number | null>(null)
  const numeric = Number(value.replace(/,/g, ""))
  const preview =
    unit === "만원" && Number.isFinite(numeric) && value !== ""
      ? formatKoreanUnit(manwonToWon(numeric))
      : null
  const typedAsWon = unit === "만원" ? manwonIfTypedAsWon(value.replace(/,/g, "")) : null

  useLayoutEffect(() => {
    const el = inputRef.current
    if (pendingDigits.current == null || !el) return
    if (document.activeElement !== el) {
      pendingDigits.current = null
      return
    }
    const pos = caretIndexAfterGroup(value, pendingDigits.current)
    el.setSelectionRange(pos, pos)
    pendingDigits.current = null
  }, [value])

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
          ref={inputRef}
          inputMode="decimal"
          value={formatGroupedInput(value)}
          placeholder={placeholder}
          onChange={(event) => {
            const composing = (event.nativeEvent as { isComposing?: boolean }).isComposing
            if (composing) return
            const el = event.currentTarget
            const caret = el.selectionStart ?? el.value.length
            pendingDigits.current = el.value.slice(0, caret).replace(/[^\d.]/g, "").length
            onChange(el.value.replace(/[^\d.]/g, ""))
          }}
          className="h-12 w-full rounded-xl border border-input bg-transparent pr-14 pl-3 text-lg tabular outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
          {unit}
        </span>
      </div>
      {typedAsWon != null ? (
        <p className="text-xs leading-5 text-muted-foreground">
          이 칸은 만원입니다. 원으로 넣으셨다면{" "}
          <button
            type="button"
            className="font-medium text-primary underline underline-offset-2"
            onClick={() => onChange(String(typedAsWon))}
          >
            {formatPlain(typedAsWon)}으로 바꾸기
          </button>
        </p>
      ) : null}
    </div>
  )
}
