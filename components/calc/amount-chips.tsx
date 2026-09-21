"use client"

import { chipMatches } from "@/lib/amount-chip"
import { cn } from "@/lib/utils"

export function AmountChips({
  options,
  value,
  onPick,
}: {
  options: { label: string; value: string }[]
  value?: string
  onPick: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = chipMatches(value, option.value)
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onPick(option.value)}
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-full border px-3.5 text-sm whitespace-nowrap",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-muted/60 text-foreground hover:bg-muted",
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
