"use client"

import type { ReactNode } from "react"
import { Delete } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatQuickResult } from "@/lib/quick-math"
import type { useQuickCalc } from "@/components/calc/use-quick-calc"

type Calc = ReturnType<typeof useQuickCalc>

const numClass = "bg-card text-foreground hover:bg-muted"
const fnClass = "bg-secondary text-foreground hover:bg-muted"
const opClass = "bg-secondary text-foreground hover:bg-muted"
const memClass =
  "h-9 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"

function Key({
  children,
  onClick,
  className,
  ariaLabel,
  compact,
}: {
  children: ReactNode
  onClick: () => void
  className?: string
  ariaLabel?: string
  compact?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "rounded-xl font-medium tabular transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px",
        compact ? "flex h-full min-h-0 items-center justify-center text-base" : "h-12 text-base",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function QuickPad({ calc, compact = false }: { calc: Calc; compact?: boolean }) {
  return (
    <div className={cn("w-full", compact && "flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "rounded-2xl bg-secondary/70 text-right",
          compact ? "shrink-0 px-3 py-2.5" : "min-h-[5.5rem] px-4 py-3",
        )}
      >
        <p
          className={cn(
            "truncate text-muted-foreground tabular",
            compact ? "min-h-4 text-xs" : "min-h-5 text-sm",
          )}
        >
          {calc.liveLine && calc.liveLine !== calc.showValue ? calc.liveLine : calc.expression || "\u00a0"}
        </p>
        <p
          className={cn(
            "truncate font-semibold tracking-tight tabular",
            compact ? "mt-0.5 text-[1.65rem] leading-none" : "mt-1 text-4xl",
          )}
          aria-live="polite"
        >
          {calc.showValue}
        </p>
      </div>

      {!compact ? (
        <>
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            <button type="button" className={memClass} disabled={calc.memory === null} onClick={() => calc.addMemory("clear")}>
              MC
            </button>
            <button type="button" className={memClass} disabled={calc.memory === null} onClick={() => calc.addMemory("recall")}>
              MR
            </button>
            <button type="button" className={memClass} onClick={() => calc.addMemory("plus")}>
              M+
            </button>
            <button type="button" className={memClass} onClick={() => calc.addMemory("minus")}>
              M−
            </button>
            <button type="button" className={memClass} onClick={() => calc.addMemory("store")}>
              MS
            </button>
          </div>
          {calc.memory !== null ? (
            <p className="mt-1 text-right text-[11px] text-muted-foreground">M {formatQuickResult(calc.memory)}</p>
          ) : (
            <p className="mt-1 h-4" />
          )}
        </>
      ) : null}

      {compact ? (
        <div className="mt-1.5 grid min-h-0 flex-1 grid-cols-4 grid-rows-5 gap-1.5 overflow-hidden">
          <Key compact className={fnClass} onClick={calc.clearAll} ariaLabel="모두 지우기">
            C
          </Key>
          <Key compact className={fnClass} onClick={calc.backspace} ariaLabel="한 칸 지우기">
            <Delete className="mx-auto size-4" />
          </Key>
          <Key compact className={fnClass} onClick={() => calc.applyUnary("percent")}>
            %
          </Key>
          <Key compact className={opClass} onClick={() => calc.chooseOp("/")}>
            ÷
          </Key>

          <Key compact className={numClass} onClick={() => calc.inputDigit("7")}>
            7
          </Key>
          <Key compact className={numClass} onClick={() => calc.inputDigit("8")}>
            8
          </Key>
          <Key compact className={numClass} onClick={() => calc.inputDigit("9")}>
            9
          </Key>
          <Key compact className={opClass} onClick={() => calc.chooseOp("*")}>
            ×
          </Key>

          <Key compact className={numClass} onClick={() => calc.inputDigit("4")}>
            4
          </Key>
          <Key compact className={numClass} onClick={() => calc.inputDigit("5")}>
            5
          </Key>
          <Key compact className={numClass} onClick={() => calc.inputDigit("6")}>
            6
          </Key>
          <Key compact className={opClass} onClick={() => calc.chooseOp("-")}>
            −
          </Key>

          <Key compact className={numClass} onClick={() => calc.inputDigit("1")}>
            1
          </Key>
          <Key compact className={numClass} onClick={() => calc.inputDigit("2")}>
            2
          </Key>
          <Key compact className={numClass} onClick={() => calc.inputDigit("3")}>
            3
          </Key>
          <Key compact className={opClass} onClick={() => calc.chooseOp("+")}>
            +
          </Key>

          <Key compact className={fnClass} onClick={calc.negate} ariaLabel="부호 바꾸기">
            +/−
          </Key>
          <Key compact className={numClass} onClick={() => calc.inputDigit("0")}>
            0
          </Key>
          <Key compact className={numClass} onClick={() => calc.inputDigit(".")}>
            .
          </Key>
          <Key compact className="bg-primary text-primary-foreground hover:bg-primary/80" onClick={calc.equals} ariaLabel="결과">
            =
          </Key>
        </div>
      ) : (
      <div className="grid grid-cols-4 gap-2">
        <Key className={fnClass} onClick={() => calc.applyUnary("percent")}>
          %
        </Key>
        <Key className={fnClass} onClick={calc.clearEntry} ariaLabel="현재 항 지우기">
          CE
        </Key>
        <Key className={fnClass} onClick={calc.clearAll} ariaLabel="모두 지우기">
          C
        </Key>
        <Key className={fnClass} onClick={calc.backspace} ariaLabel="한 칸 지우기">
          <Delete className="mx-auto size-5" />
        </Key>

            <Key className={fnClass} onClick={() => calc.applyUnary("inv")}>
              1/x
            </Key>
            <Key className={fnClass} onClick={() => calc.applyUnary("sqr")}>
              x²
            </Key>
            <Key className={fnClass} onClick={() => calc.applyUnary("sqrt")}>
              √
            </Key>
            <Key className={opClass} onClick={() => calc.chooseOp("/")}>
              ÷
            </Key>

        <Key className={numClass} onClick={() => calc.inputDigit("7")}>
          7
        </Key>
        <Key className={numClass} onClick={() => calc.inputDigit("8")}>
          8
        </Key>
        <Key className={numClass} onClick={() => calc.inputDigit("9")}>
          9
        </Key>
        <Key className={opClass} onClick={() => calc.chooseOp("*")}>
          ×
        </Key>

        <Key className={numClass} onClick={() => calc.inputDigit("4")}>
          4
        </Key>
        <Key className={numClass} onClick={() => calc.inputDigit("5")}>
          5
        </Key>
        <Key className={numClass} onClick={() => calc.inputDigit("6")}>
          6
        </Key>
        <Key className={opClass} onClick={() => calc.chooseOp("-")}>
          −
        </Key>

        <Key className={numClass} onClick={() => calc.inputDigit("1")}>
          1
        </Key>
        <Key className={numClass} onClick={() => calc.inputDigit("2")}>
          2
        </Key>
        <Key className={numClass} onClick={() => calc.inputDigit("3")}>
          3
        </Key>
        <Key className={opClass} onClick={() => calc.chooseOp("+")}>
          +
        </Key>

          <Key className={fnClass} onClick={calc.negate} ariaLabel="부호 바꾸기">
            +/−
          </Key>
        <Key className={numClass} onClick={() => calc.inputDigit("0")}>
          0
        </Key>
        <Key className={numClass} onClick={() => calc.inputDigit(".")}>
          .
        </Key>
        <Key
          className="bg-primary text-primary-foreground hover:bg-primary/80"
          onClick={calc.equals}
          ariaLabel="결과"
        >
          =
        </Key>
      </div>
      )}
    </div>
  )
}
