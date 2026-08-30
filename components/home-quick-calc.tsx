"use client"

import { useState } from "react"
import Link from "next/link"
import { QuickPad } from "@/components/calc/quick-pad"
import { useQuickCalc } from "@/components/calc/use-quick-calc"
import { cn } from "@/lib/utils"

export function HomeQuickCalc() {
  const [active, setActive] = useState(false)
  const calc = useQuickCalc({ keyboard: active })

  return (
    <aside
      aria-label="바로 계산"
      tabIndex={0}
      className="flex h-full min-h-0 w-full flex-col outline-none"
      onFocus={() => setActive(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setActive(false)
        }
      }}
    >
      <div className="flex shrink-0 items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">바로 계산</h2>
        <Link href="/calc/quick/" className="text-xs text-muted-foreground hover:text-foreground">
          크게
        </Link>
      </div>
      <div
        className={cn(
          "mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-card p-3 ring-1 ring-foreground/8",
          active && "ring-2 ring-primary/40",
        )}
      >
        <QuickPad calc={calc} compact />
      </div>
    </aside>
  )
}
