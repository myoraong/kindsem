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

export function quickCopyText(value: number) {
  return String(Number(value.toPrecision(12)))
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
