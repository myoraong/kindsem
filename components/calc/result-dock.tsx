"use client"

import { Button } from "@/components/ui/button"

export function ResultDock({
  title,
  display,
  onCopy,
}: {
  title: string
  display: string
  onCopy: () => void
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pt-2.5 backdrop-blur-md lg:hidden pb-[max(0.65rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <p className="min-w-0 flex-1">
          <span className="block text-[11px] text-muted-foreground">{title}</span>
          <span className="block truncate text-lg font-semibold tabular">{display}</span>
        </p>
        <Button type="button" className="h-10 shrink-0 px-4" onClick={onCopy}>
          복사
        </Button>
      </div>
    </div>
  )
}
