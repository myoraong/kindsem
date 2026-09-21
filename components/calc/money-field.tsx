"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { fieldNeedsReveal } from "@/lib/field-reveal"
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
import { cn } from "@/lib/utils"

function revealField(el: HTMLElement) {
  const dock = window.matchMedia("(max-width: 1023px)").matches ? 96 : 16
  const rect = el.getBoundingClientRect()
  if (!fieldNeedsReveal(rect, window.innerHeight, 80, dock)) return
  window.setTimeout(() => {
    el.scrollIntoView({ block: "center", behavior: "smooth" })
  }, 280)
}

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
  const showClear = (draft ?? value) !== ""
  const wideUnit = unit.length >= 3

  useLayoutEffect(() => {
    setDraft(null)
  }, [value])

  useLayoutEffect(() => {
    if (!draft) return
    const spoken = unit === "만원" ? manwonFromKorean(draft) : unit === "원" ? wonFromKorean(draft) : null
    if (spoken == null) return
    setDraft(null)
    setSpokenMode(false)
    onChange(formatCalcNumber(spoken))
  }, [draft, unit, onChange])

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
    <div className="scroll-mb-28 space-y-1.5 lg:scroll-mb-4">
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
            revealField(el)
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
          className={cn(
            "h-12 w-full rounded-xl border border-input bg-transparent pl-3 text-lg tabular outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            showClear ? (wideUnit ? "pr-28" : "pr-20") : "pr-14",
          )}
        />
        {showClear ? (
          <button
            type="button"
            aria-label={`${label} 지우기`}
            className={cn(
              "absolute top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground",
              wideUnit ? "right-[4.75rem]" : "right-11",
            )}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              pendingDigits.current = null
              setDraft(null)
              onChange("")
            }}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ×
            </span>
          </button>
        ) : null}
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
