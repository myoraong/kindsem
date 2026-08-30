"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  type QuickOp,
  QUICK_OP_LABEL,
  computeQuick,
  formatQuickInput,
  formatQuickResult,
  previewQuickResult,
  quickToNumber,
} from "@/lib/quick-math"

export type QuickHistoryItem = { id: number; expression: string; value: number }

export function useQuickCalc({ keyboard }: { keyboard: boolean }) {
  const [display, setDisplay] = useState("0")
  const [expression, setExpression] = useState("")
  const [stored, setStored] = useState<number | null>(null)
  const [op, setOp] = useState<QuickOp | null>(null)
  const [waiting, setWaiting] = useState(false)
  const [error, setError] = useState(false)
  const [memory, setMemory] = useState<number | null>(null)
  const [history, setHistory] = useState<QuickHistoryItem[]>([])
  const historyId = useRef(0)

  const pushHistory = useCallback((line: string, value: number) => {
    historyId.current += 1
    setHistory((prev) => [{ id: historyId.current, expression: line, value }, ...prev].slice(0, 24))
  }, [])

  const currentNumber = quickToNumber(display)
  const preview = previewQuickResult({ display, stored, op, waiting, error })
  const showValue = preview.text

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
    [error, waiting],
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
      const current = quickToNumber(display)
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
        label = `1/(${formatQuickResult(current)})`
      } else if (kind === "sqr") {
        next = current * current
        label = `sqr(${formatQuickResult(current)})`
      } else if (kind === "sqrt") {
        if (current < 0) {
          setError(true)
          return
        }
        next = Math.sqrt(current)
        label = `√(${formatQuickResult(current)})`
      } else if (stored !== null && op && (op === "+" || op === "-")) {
        next = (stored * current) / 100
        label = `${formatQuickResult(current)}%`
      } else {
        next = current / 100
        label = `${formatQuickResult(current)}%`
      }
      if (next === null || !Number.isFinite(next)) {
        setError(true)
        return
      }
      setExpression(label)
      setDisplay(formatQuickResult(next))
      setWaiting(true)
      pushHistory(label, next)
    },
    [display, op, pushHistory, stored],
  )

  const chooseOp = useCallback(
    (nextOp: QuickOp) => {
      if (error) return
      const current = quickToNumber(display)
      if (current === null) {
        setError(true)
        return
      }
      if (op && stored !== null && !waiting) {
        const result = computeQuick(stored, op, current)
        if (result === null || !Number.isFinite(result)) {
          setError(true)
          return
        }
        setStored(result)
        setDisplay(formatQuickResult(result))
        setExpression(`${formatQuickResult(result)} ${QUICK_OP_LABEL[nextOp]}`)
        pushHistory(`${formatQuickResult(stored)} ${QUICK_OP_LABEL[op]} ${formatQuickResult(current)}`, result)
      } else {
        setStored(current)
        setExpression(`${formatQuickResult(current)} ${QUICK_OP_LABEL[nextOp]}`)
      }
      setOp(nextOp)
      setWaiting(true)
    },
    [display, error, op, pushHistory, stored, waiting],
  )

  const equals = useCallback(() => {
    if (error) return
    const current = quickToNumber(display)
    if (current === null) {
      setError(true)
      return
    }
    if (!op || stored === null) {
      setExpression(`${formatQuickResult(current)} =`)
      setWaiting(true)
      return
    }
    const result = computeQuick(stored, op, current)
    if (result === null || !Number.isFinite(result)) {
      setError(true)
      return
    }
    const line = `${formatQuickResult(stored)} ${QUICK_OP_LABEL[op]} ${formatQuickResult(current)}`
    pushHistory(line, result)
    setExpression(`${line} =`)
    setDisplay(formatQuickResult(result))
    setStored(null)
    setOp(null)
    setWaiting(true)
  }, [display, error, op, pushHistory, stored])

  const recallHistory = useCallback((item: QuickHistoryItem) => {
    setDisplay(formatQuickResult(item.value))
    setExpression(item.expression)
    setStored(null)
    setOp(null)
    setWaiting(true)
    setError(false)
  }, [])

  const addMemory = useCallback(
    (kind: "clear" | "recall" | "plus" | "minus" | "store") => {
      if (kind === "clear") {
        setMemory(null)
        return
      }
      if (kind === "recall") {
        if (memory === null) return
        setDisplay(formatQuickResult(memory))
        setWaiting(true)
        setError(false)
        return
      }
      const n = quickToNumber(display)
      if (n === null) return
      if (kind === "plus") setMemory((prev) => (prev ?? 0) + n)
      if (kind === "minus") setMemory((prev) => (prev ?? 0) - n)
      if (kind === "store") setMemory(n)
    },
    [display, memory],
  )

  const clearHistory = useCallback(() => setHistory([]), [])
  const removeHistory = useCallback((id: number) => {
    setHistory((prev) => prev.filter((row) => row.id !== id))
  }, [])

  useEffect(() => {
    if (!keyboard) return
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable=true]")
      ) {
        return
      }
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
  }, [applyUnary, backspace, chooseOp, clearAll, equals, inputDigit, keyboard])

  const liveLine = error
    ? "오류"
    : op && stored !== null
      ? `${formatQuickResult(stored)} ${QUICK_OP_LABEL[op]}${waiting ? "" : ` ${formatQuickInput(display)}`}`
      : expression || display

  return {
    display,
    expression,
    showValue,
    currentNumber,
    memory,
    history,
    liveLine,
    clearAll,
    clearEntry,
    inputDigit,
    backspace,
    negate,
    applyUnary,
    chooseOp,
    equals,
    addMemory,
    recallHistory,
    clearHistory,
    removeHistory,
  }
}
