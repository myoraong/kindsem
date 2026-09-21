"use client"

import { Button } from "@/components/ui/button"
import { copyResultLine, shareResultLine, useCanShare } from "@/components/calc/result-actions"
import { useResultFlash } from "@/components/calc/use-result-flash"
import { cn } from "@/lib/utils"

export function ResultDock({
  title,
  display,
  line,
}: {
  title: string
  display: string
  line: string
}) {
  const canShare = useCanShare()
  const flash = useResultFlash(display)

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pt-2.5 backdrop-blur-md lg:hidden pb-[max(0.65rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-5xl items-center gap-2">
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          aria-label={`${title} 자세한 결과`}
          onClick={() => {
            document.getElementById("calc-result")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }}
        >
          <span className="block text-[11px] text-muted-foreground">{title}</span>
          <span className={cn("block truncate text-lg font-semibold tabular", flash && "result-flash")}>{display}</span>
        </button>
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 px-3"
          aria-label="결과와 주소 복사"
          onClick={() => {
            void copyResultLine(line)
          }}
        >
          복사
        </Button>
        {canShare ? (
          <Button
            type="button"
            className="h-11 shrink-0 px-3"
            aria-label="결과와 주소 공유"
            onClick={() => {
              void shareResultLine(line)
            }}
          >
            공유
          </Button>
        ) : null}
      </div>
    </div>
  )
}
