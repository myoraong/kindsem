"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import {
  caretIndexAfterGroup,
  formatCalcNumber,
  formatGroupedInput,
  formatKoreanUnit,
  formatPlain,
  manwonFromKorean,
  manwonIfTypedAsWon,
  manwonToWon,
  wonFromKorean,
} from "@/lib/format"

function focusNextInput(current: HTMLInputElement) {
  const root = current.closest("section")
  if (!root) {
    current.blur()
    return
  }
  const fields = [...root.querySelectorAll("input")].filter(
    (el): el is HTMLInputElement =>
      el instanceof HTMLInputElement && el.type !== "checkbox" && el.type !== "radio" && !el.disabled,
  )
  const next = fields[fields.indexOf(current) + 1]
  if (next) next.focus()
  else current.blur()
}

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
  const selectOnFocus = useRef(false)
  const keepSpoken = useRef(false)
  const [draft, setDraft] = useState<string | null>(null)
  const [spokenMode, setSpokenMode] = useState(false)
  const canSpeak = unit === "만원" || unit === "원"
  const numeric = Number(value.replace(/,/g, ""))
  const preview =
    unit === "만원" && Number.isFinite(numeric) && value !== ""
      ? formatKoreanUnit(manwonToWon(numeric))
      : null
  const typedAsWon = unit === "만원" ? manwonIfTypedAsWon(value.replace(/,/g, "")) : null

  useLayoutEffect(() => {
    setDraft(null)
  }, [value])

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
          inputMode={spokenMode ? "text" : "decimal"}
          enterKeyHint="next"
          autoComplete="off"
          value={draft ?? formatGroupedInput(value)}
          placeholder={placeholder}
          onFocus={(event) => {
            const el = event.currentTarget
            selectOnFocus.current = true
            requestAnimationFrame(() => {
              if (document.activeElement === el) el.select()
            })
          }}
          onMouseUp={(event) => {
            if (!selectOnFocus.current) return
            event.preventDefault()
            selectOnFocus.current = false
          }}
          onBlur={() => {
            setDraft(null)
            if (!keepSpoken.current) setSpokenMode(false)
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return
            if ((event.nativeEvent as { isComposing?: boolean }).isComposing) return
            event.preventDefault()
            focusNextInput(event.currentTarget)
          }}
          onChange={(event) => {
            const raw = event.currentTarget.value
            const composing = (event.nativeEvent as { isComposing?: boolean }).isComposing
            if (composing) {
              setDraft(raw)
              return
            }
            const spoken =
              unit === "만원" ? manwonFromKorean(raw) : unit === "원" ? wonFromKorean(raw) : null
            if (spoken != null) {
              pendingDigits.current = null
              setDraft(null)
              setSpokenMode(false)
              onChange(formatCalcNumber(spoken))
              return
            }
            if ((unit === "만원" || unit === "원") && /[억만천백십]/.test(raw)) {
              setDraft(raw)
              return
            }
            const el = event.currentTarget
            const caret = el.selectionStart ?? el.value.length
            pendingDigits.current = el.value.slice(0, caret).replace(/[^\d.]/g, "").length
            setDraft(null)
            onChange(raw.replace(/[^\d.]/g, ""))
          }}
          className="h-12 w-full rounded-xl border border-input bg-transparent pr-14 pl-3 text-lg tabular outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
          {unit}
        </span>
      </div>
      {canSpeak && (spokenMode || draft) ? (
        <p className="text-xs leading-5 text-muted-foreground">
          {draft ? "만이나 억까지 치면 숫자로 바꿉니다." : "예: 4천만, 1억 2천만, 1.2만"}
        </p>
      ) : canSpeak ? (
        <button
          type="button"
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            keepSpoken.current = true
            setSpokenMode(true)
            const el = inputRef.current
            el?.blur()
            requestAnimationFrame(() => {
              keepSpoken.current = false
              el?.focus()
            })
          }}
        >
          {unit === "원" ? "1.2만처럼 말하기" : "4천만처럼 말하기"}
        </button>
      ) : null}
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
