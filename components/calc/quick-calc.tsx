"use client"

import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { CalcShell } from "@/components/calc/calc-shell"
import { QuickPad } from "@/components/calc/quick-pad"
import { useQuickCalc } from "@/components/calc/use-quick-calc"
import type { CalcItem } from "@/lib/catalog"
import { formatQuickResult, shownCopyText } from "@/lib/quick-math"
import { cn } from "@/lib/utils"

export function QuickCalc({ item }: { item: CalcItem }) {
  const calc = useQuickCalc({ keyboard: true })

  async function copyShown(shown: string) {
    const digits = shownCopyText(shown)
    if (!digits) return
    await navigator.clipboard.writeText(digits)
    toast.success("숫자를 복사했어요")
  }

  const ghostTextBtn =
    "inline-flex h-8 shrink-0 items-center rounded-md px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"

  return (
    <CalcShell
      item={item}
      result={
        <aside className="paper-rule rounded-2xl bg-card p-5 ring-1 ring-foreground/8 md:sticky md:top-20">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">계산 기록</p>
            <button
              type="button"
              disabled={calc.history.length === 0}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              onClick={calc.clearHistory}
            >
              <Trash2 className="size-3.5" />
              모두 지우기
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-secondary/70 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">지금</p>
              <button
                type="button"
                disabled={shownCopyText(calc.showValue) === null}
                className={cn(ghostTextBtn, "disabled:pointer-events-none disabled:opacity-40")}
                aria-label="복사"
                onClick={() => copyShown(calc.showValue)}
              >
                복사
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground tabular">{calc.liveLine}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular">{calc.showValue}</p>
          </div>

          {calc.history.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              계산하면 기록이 쌓입니다. 각 결과를 복사하거나 하나씩 지울 수 있어요.
            </p>
          ) : (
            <div className="mt-4 space-y-1 border-t border-dashed border-border pt-3">
              {calc.history.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center gap-1 rounded-lg py-0.5 pl-1 hover:bg-muted/70"
                >
                  <button
                    type="button"
                    onClick={() => calc.recallHistory(row)}
                    className="min-w-0 flex-1 py-1.5 text-left text-sm"
                  >
                    <span className="block truncate text-muted-foreground">{row.expression}</span>
                    <span className="tabular font-medium">{formatQuickResult(row.value)}</span>
                  </button>
                  <button
                    type="button"
                    className={ghostTextBtn}
                    aria-label="복사"
                    onClick={() => copyShown(formatQuickResult(row.value))}
                  >
                    복사
                  </button>
                  <button
                    type="button"
                    className={ghostTextBtn}
                    aria-label="삭제"
                    onClick={() => calc.removeHistory(row.id)}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </aside>
      }
    >
      <div className="mx-auto w-full max-w-sm">
        <QuickPad calc={calc} />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          키보드 숫자와 +, −, ×, ÷, Enter도 그대로 쓸 수 있어요.
        </p>
      </div>
    </CalcShell>
  )
}
