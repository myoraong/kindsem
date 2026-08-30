"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { QuickPad } from "@/components/calc/quick-pad"
import { useQuickCalc } from "@/components/calc/use-quick-calc"
import { quickCopyText } from "@/lib/quick-math"
import { cn } from "@/lib/utils"

const ghostBtn =
  "inline-flex h-7 items-center rounded-md px-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"

export function HomeQuickCalc({ folded = false }: { folded?: boolean }) {
  const [active, setActive] = useState(false)
  const [open, setOpen] = useState(!folded)
  const calc = useQuickCalc({ keyboard: active && open })

  async function copy() {
    if (calc.currentNumber === null) return
    await navigator.clipboard.writeText(quickCopyText(calc.currentNumber))
    toast.success("숫자를 복사했어요")
  }

  if (folded && !open) {
    return (
      <aside aria-label="바로 계산">
        <button
          type="button"
          aria-expanded={false}
          className="flex h-11 w-full items-center justify-between rounded-2xl bg-card px-4 text-sm ring-1 ring-foreground/8"
          onClick={() => setOpen(true)}
        >
          <span className="font-medium">바로 계산</span>
          <span className="text-muted-foreground">열기</span>
        </button>
      </aside>
    )
  }

  return (
    <aside
      aria-label="바로 계산"
      aria-expanded={folded ? true : undefined}
      tabIndex={0}
      className={cn("flex w-full min-h-0 flex-col outline-none", !folded && "h-full")}
      onFocus={() => setActive(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setActive(false)
        }
      }}
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">바로 계산</h2>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className={ghostBtn}
            disabled={calc.currentNumber === null}
            aria-label="복사"
            onClick={copy}
          >
            복사
          </button>
          <Link href="/calc/quick/" className={ghostBtn}>
            크게
          </Link>
          {folded ? (
            <button type="button" className={ghostBtn} aria-expanded={true} onClick={() => setOpen(false)}>
              접기
            </button>
          ) : null}
        </div>
      </div>
      <div
        className={cn(
          "mt-2 flex min-h-0 flex-col overflow-hidden rounded-2xl bg-card p-3 ring-1 ring-foreground/8",
          folded ? "h-[22rem]" : "flex-1",
          active && "ring-2 ring-primary/40",
        )}
      >
        <QuickPad calc={calc} compact />
      </div>
    </aside>
  )
}
