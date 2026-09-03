"use client"

import { cn } from "@/lib/utils"

export function AmountChips({
  options,
  onPick,
}: {
  options: { label: string; value: string }[]
  onPick: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onPick(option.value)}
          className={cn(
            "h-9 rounded-full border border-border bg-muted/60 px-3 text-sm text-foreground",
            "hover:bg-muted",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
