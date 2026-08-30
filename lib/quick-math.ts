export type QuickOp = "+" | "-" | "*" | "/"

export const QUICK_OP_LABEL: Record<QuickOp, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
}

export function quickToNumber(display: string) {
  const n = Number(display.replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}

export function formatQuickInput(display: string) {
  if (!display || display === "오류") return display
  const negative = display.startsWith("-")
  const raw = (negative ? display.slice(1) : display).replace(/,/g, "")
  const dot = raw.includes(".")
  const [intPart, frac] = raw.split(".")
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  const next = dot ? `${grouped}.${frac ?? ""}` : grouped
  return negative ? `-${next}` : next
}

export function formatQuickResult(value: number) {
  if (!Number.isFinite(value)) return "오류"
  if (Math.abs(value) > 1e15) return "오류"
  const rounded = Number(value.toPrecision(12))
  return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 12 }).format(rounded)
}

/** 화면에 나온 큰 숫자. 천 단위 쉼표만 빼고 그대로 복사한다. */
export function shownCopyText(shown: string) {
  if (!shown || shown === "오류") return null
  const digits = shown.replace(/,/g, "")
  return digits || null
}

export function computeQuick(left: number, op: QuickOp, right: number) {
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

/** 식 아래 큰 숫자. 두 번째 항을 치는 동안은 잠정 결과. */
export function previewQuickResult(input: {
  display: string
  stored: number | null
  op: QuickOp | null
  waiting: boolean
  error: boolean
}) {
  if (input.error) return { text: "오류", value: null as number | null }
  const current = quickToNumber(input.display)
  if (input.op && input.stored !== null) {
    if (input.waiting) {
      return { text: formatQuickResult(input.stored), value: input.stored }
    }
    if (current === null) return { text: formatQuickInput(input.display), value: null }
    const result = computeQuick(input.stored, input.op, current)
    if (result === null || !Number.isFinite(result)) return { text: "오류", value: null }
    return { text: formatQuickResult(result), value: result }
  }
  if (current === null) return { text: formatQuickInput(input.display), value: null }
  return { text: formatQuickInput(input.display), value: current }
}

