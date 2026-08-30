"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { Delete, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { CalcShell } from "@/components/calc/calc-shell"
import type { CalcItem } from "@/lib/catalog"
import { cn } from "@/lib/utils"

type Op = "+" | "-" | "*" | "/"

type HistoryItem = { id: number; expression: string; value: number }

const OP_LABEL: Record<Op, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
}

function toNumber(display: string) {
  const n = Number(display.replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}

function formatResult(value: number) {
  if (!Number.isFinite(value)) return "오류"
  if (Math.abs(value) > 1e15) return "오류"
  const rounded = Number(value.toPrecision(12))
  return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 12 }).format(rounded)
}

function toCopyText(value: number) {
  return String(Number(value.toPrecision(12)))
}

function compute(left: number, op: Op, right: number) {
  switch (op) {
    case "+":
      return left + right
    case "-":
      return left - right
    case "*":
      return left * right
    case "/":
      return right === 0 ? null : left / right
  }
}

const keyBase =
  "h-12 rounded-xl text-base font-medium tabular transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-40"

function Key({
  children,
  onClick,
  className,
  ariaLabel,
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  className?: string
  ariaLabel?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(keyBase, className)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function QuickCalc({ item }: { item: CalcItem }) {
  const [display, setDisplay] = useState("0")
  const [expression, setExpression] = useState("")
  const [stored, setStored] = useState<number | null>(null)
  const [op, setOp] = useState<Op | null>(null)
  const [waiting, setWaiting] = useState(false)
  const [error, setError] = useState(false)
  const [memory, setMemory] = useState<number | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const historyId = useRef(0)

  const pushHistory = useCallback((line: string, value: number) => {
    historyId.current += 1
    setHistory((prev) => [{ id: historyId.current, expression: line, value }, ...prev].slice(0, 24))
  }, [])

  const showValue = error ? "오류" : display
  const currentNumber = toNumber(display)

  const clearAll = useCallback(() => {
    setDisplay("0")
    setExpression("")
    setStored(null)
    setOp(null)
    setWaiting(false)
    setError(false)
  }, [])

  const clearEntry = useCallback(() => {
    setDisplay("0")
    setWaiting(false)
    setError(false)
  }, [])

  const inputDigit = useCallback(
    (digit: string) => {
      if (error) {
        setDisplay(digit === "." ? "0." : digit)
        setExpression("")
        setStored(null)
        setOp(null)
        setWaiting(false)
        setError(false)
        return
      }
      if (waiting) {
        setWaiting(false)
        setDisplay(digit === "." ? "0." : digit)
        return
      }
      setDisplay((prev) => {
        if (prev === "0" || prev === "-0") return digit === "." ? "0." : digit
        if (digit === "." && prev.includes(".")) return prev
        if (prev.replace("-", "").replace(".", "").length >= 15) return prev
        return prev + digit
      })
    },
    [error, waiting]
  )

  const backspace = useCallback(() => {
    if (error) {
      clearAll()
      return
    }
    if (waiting) return
    setDisplay((prev) => {
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith("-"))) return "0"
      return prev.slice(0, -1)
    })
  }, [clearAll, error, waiting])

  const negate = useCallback(() => {
    if (error) return
    setDisplay((prev) => {
      if (prev === "0" || prev === "0.") return prev
      return prev.startsWith("-") ? prev.slice(1) : `-${prev}`
    })
  }, [error])

  const applyUnary = useCallback(
    (kind: "inv" | "sqr" | "sqrt" | "percent") => {
      const current = toNumber(display)
      if (current === null) {
        setError(true)
        return
      }
      let next: number | null = null
      let label = ""
      if (kind === "inv") {
        if (current === 0) {
          setError(true)
          return
        }
        next = 1 / current
        label = `1/(${formatResult(current)})`
      } else if (kind === "sqr") {
        next = current * current
        label = `sqr(${formatResult(current)})`
      } else if (kind === "sqrt") {
        if (current < 0) {
          setError(true)
          return
        }
        next = Math.sqrt(current)
        label = `√(${formatResult(current)})`
      } else {
        if (stored !== null && op && (op === "+" || op === "-")) {
          next = (stored * current) / 100
        } else {
          next = current / 100
        }
        label = `${formatResult(current)}%`
      }
      if (next === null || !Number.isFinite(next)) {
        setError(true)
        return
      }
      setExpression(label)
      setDisplay(formatResult(next))
      setWaiting(true)
      pushHistory(label, next)
    },
    [display, op, pushHistory, stored]
  )

  const chooseOp = useCallback(
    (nextOp: Op) => {
      if (error) return
      const current = toNumber(display)
      if (current === null) {
        setError(true)
        return
      }
      if (op && stored !== null && !waiting) {
        const result = compute(stored, op, current)
        if (result === null || !Number.isFinite(result)) {
          setError(true)
          return
        }
        setStored(result)
        setDisplay(formatResult(result))
        setExpression(`${formatResult(result)} ${OP_LABEL[nextOp]}`)
        pushHistory(`${formatResult(stored)} ${OP_LABEL[op]} ${formatResult(current)}`, result)
      } else {
        setStored(current)
        setExpression(`${formatResult(current)} ${OP_LABEL[nextOp]}`)
      }
      setOp(nextOp)
      setWaiting(true)
    },
    [display, error, op, pushHistory, stored, waiting]
  )

  const equals = useCallback(() => {
    if (error) return
    const current = toNumber(display)
    if (current === null) {
      setError(true)
      return
    }
    if (!op || stored === null) {
      setExpression(`${formatResult(current)} =`)
      setWaiting(true)
      return
    }
    const result = compute(stored, op, current)
    if (result === null || !Number.isFinite(result)) {
      setError(true)
      return
    }
    const line = `${formatResult(stored)} ${OP_LABEL[op]} ${formatResult(current)}`
    pushHistory(line, result)
    setExpression(`${line} =`)
    setDisplay(formatResult(result))
    setStored(null)
    setOp(null)
    setWaiting(true)
  }, [display, error, op, pushHistory, stored])

  const recallHistory = useCallback((item: HistoryItem) => {
    setDisplay(formatResult(item.value))
    setExpression(item.expression)
    setStored(null)
    setOp(null)
    setWaiting(true)
    setError(false)
  }, [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const key = event.key
      if (key >= "0" && key <= "9") {
        event.preventDefault()
        inputDigit(key)
        return
      }
      if (key === "." || key === ",") {
        event.preventDefault()
        inputDigit(".")
        return
      }
      if (key === "+" || key === "-" || key === "*" || key === "/") {
        event.preventDefault()
        chooseOp(key)
        return
      }
      if (key === "Enter" || key === "=") {
        event.preventDefault()
        equals()
        return
      }
      if (key === "Backspace") {
        event.preventDefault()
        backspace()
        return
      }
      if (key === "Escape") {
        event.preventDefault()
        clearAll()
        return
      }
      if (key === "%") {
        event.preventDefault()
        applyUnary("percent")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [applyUnary, backspace, chooseOp, clearAll, equals, inputDigit])

  async function copyValue(value: number) {
    await navigator.clipboard.writeText(toCopyText(value))
    toast.success("숫자를 복사했어요")
  }

  function removeHistory(id: number) {
    setHistory((prev) => prev.filter((row) => row.id !== id))
  }

  const liveLine =
    error
      ? "오류"
      : op && stored !== null
        ? `${formatResult(stored)} ${OP_LABEL[op]}${waiting ? "" : ` ${display}`}`
        : expression || display

  const numClass = "bg-card text-foreground hover:bg-muted"
  const fnClass = "bg-secondary text-foreground hover:bg-muted"
  const opClass = "bg-secondary text-foreground hover:bg-muted"
  const memClass =
    "h-9 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
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
              disabled={history.length === 0}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              onClick={() => setHistory([])}
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
                disabled={error || currentNumber === null}
                className={cn(
                  ghostTextBtn,
                  "disabled:pointer-events-none disabled:opacity-40"
                )}
                aria-label="복사"
                onClick={() => currentNumber !== null && copyValue(currentNumber)}
              >
                복사
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground tabular">{liveLine}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular">{showValue}</p>
          </div>

          {history.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              계산하면 기록이 쌓입니다. 각 결과를 복사하거나 하나씩 지울 수 있어요.
            </p>
          ) : (
            <div className="mt-4 space-y-1 border-t border-dashed border-border pt-3">
              {history.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center gap-1 rounded-lg py-0.5 pl-1 hover:bg-muted/70"
                >
                  <button
                    type="button"
                    onClick={() => recallHistory(row)}
                    className="min-w-0 flex-1 py-1.5 text-left text-sm"
                  >
                    <span className="block truncate text-muted-foreground">{row.expression}</span>
                    <span className="tabular font-medium">{formatResult(row.value)}</span>
                  </button>
                  <button
                    type="button"
                    className={ghostTextBtn}
                    aria-label="복사"
                    onClick={() => copyValue(row.value)}
                  >
                    복사
                  </button>
                  <button
                    type="button"
                    className={ghostTextBtn}
                    aria-label="삭제"
                    onClick={() => removeHistory(row.id)}
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
        <div className="min-h-[5.5rem] rounded-2xl bg-secondary/70 px-4 py-3 text-right">
          <p className="min-h-5 text-sm text-muted-foreground tabular">{expression || "\u00a0"}</p>
          <p
            id="expr"
            className="mt-1 truncate text-4xl font-semibold tracking-tight tabular"
            aria-live="polite"
          >
            {showValue}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-5 gap-1.5">
          <button
            type="button"
            className={memClass}
            disabled={memory === null}
            onClick={() => setMemory(null)}
          >
            MC
          </button>
          <button
            type="button"
            className={memClass}
            disabled={memory === null}
            onClick={() => {
              if (memory === null) return
              setDisplay(formatResult(memory))
              setWaiting(true)
              setError(false)
            }}
          >
            MR
          </button>
          <button
            type="button"
            className={memClass}
            onClick={() => {
              const n = toNumber(display)
              if (n === null) return
              setMemory((prev) => (prev ?? 0) + n)
            }}
          >
            M+
          </button>
          <button
            type="button"
            className={memClass}
            onClick={() => {
              const n = toNumber(display)
              if (n === null) return
              setMemory((prev) => (prev ?? 0) - n)
            }}
          >
            M−
          </button>
          <button
            type="button"
            className={memClass}
            onClick={() => {
              const n = toNumber(display)
              if (n === null) return
              setMemory(n)
            }}
          >
            MS
          </button>
        </div>
        {memory !== null ? (
          <p className="mt-1 text-right text-[11px] text-muted-foreground">M {formatResult(memory)}</p>
        ) : (
          <p className="mt-1 h-4" />
        )}

        <div className="grid grid-cols-4 gap-2">
          <Key className={fnClass} onClick={() => applyUnary("percent")}>
            %
          </Key>
          <Key className={fnClass} onClick={clearEntry} ariaLabel="현재 항 지우기">
            CE
          </Key>
          <Key className={fnClass} onClick={clearAll} ariaLabel="모두 지우기">
            C
          </Key>
          <Key className={fnClass} onClick={backspace} ariaLabel="한 칸 지우기">
            <Delete className="mx-auto size-5" />
          </Key>

          <Key className={fnClass} onClick={() => applyUnary("inv")}>
            1/x
          </Key>
          <Key className={fnClass} onClick={() => applyUnary("sqr")}>
            x²
          </Key>
          <Key className={fnClass} onClick={() => applyUnary("sqrt")}>
            √
          </Key>
          <Key className={opClass} onClick={() => chooseOp("/")}>
            ÷
          </Key>

          <Key className={numClass} onClick={() => inputDigit("7")}>
            7
          </Key>
          <Key className={numClass} onClick={() => inputDigit("8")}>
            8
          </Key>
          <Key className={numClass} onClick={() => inputDigit("9")}>
            9
          </Key>
          <Key className={opClass} onClick={() => chooseOp("*")}>
            ×
          </Key>

          <Key className={numClass} onClick={() => inputDigit("4")}>
            4
          </Key>
          <Key className={numClass} onClick={() => inputDigit("5")}>
            5
          </Key>
          <Key className={numClass} onClick={() => inputDigit("6")}>
            6
          </Key>
          <Key className={opClass} onClick={() => chooseOp("-")}>
            −
          </Key>

          <Key className={numClass} onClick={() => inputDigit("1")}>
            1
          </Key>
          <Key className={numClass} onClick={() => inputDigit("2")}>
            2
          </Key>
          <Key className={numClass} onClick={() => inputDigit("3")}>
            3
          </Key>
          <Key className={opClass} onClick={() => chooseOp("+")}>
            +
          </Key>

          <Key className={fnClass} onClick={negate} ariaLabel="부호 바꾸기">
            +/−
          </Key>
          <Key className={numClass} onClick={() => inputDigit("0")}>
            0
          </Key>
          <Key className={numClass} onClick={() => inputDigit(".")}>
            .
          </Key>
          <Key
            className="bg-primary text-primary-foreground hover:bg-primary/80"
            onClick={equals}
            ariaLabel="결과"
          >
            =
          </Key>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          키보드 숫자와 +, −, ×, ÷, Enter도 그대로 쓸 수 있어요.
        </p>
      </div>
    </CalcShell>
  )
}
