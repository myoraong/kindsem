type Token =
  | { type: "number"; value: number }
  | { type: "op"; value: string }
  | { type: "lparen" }
  | { type: "rparen" }

const PRECEDENCE: Record<string, { prec: number; right: boolean }> = {
  u: { prec: 5, right: true },
  "^": { prec: 4, right: true },
  "*": { prec: 3, right: false },
  "/": { prec: 3, right: false },
  "+": { prec: 2, right: false },
  "-": { prec: 2, right: false },
}

function tokenize(source: string): Token[] | null {
  const input = source
    .replace(/[×xX]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/[−–]/g, "-")
    .replace(/,/g, "")
    .trim()

  if (!input) return []

  const tokens: Token[] = []
  let i = 0

  while (i < input.length) {
    const ch = input[i]
    if (ch === " " || ch === "\t") {
      i += 1
      continue
    }

    if (ch === "(") {
      tokens.push({ type: "lparen" })
      i += 1
      continue
    }
    if (ch === ")") {
      tokens.push({ type: "rparen" })
      i += 1
      continue
    }

    if ("+-*/^".includes(ch)) {
      const prev = tokens[tokens.length - 1]
      const unary =
        ch === "-" &&
        (!prev || prev.type === "op" || prev.type === "lparen")
      tokens.push({ type: "op", value: unary ? "u" : ch })
      i += 1
      continue
    }

    if (ch === "%" || /\d/.test(ch) || ch === ".") {
      let j = i
      let sawDot = false
      while (j < input.length && (/\d/.test(input[j]) || input[j] === ".")) {
        if (input[j] === ".") {
          if (sawDot) return null
          sawDot = true
        }
        j += 1
      }
      const raw = input.slice(i, j)
      if (!raw || raw === ".") return null
      let value = Number(raw)
      if (!Number.isFinite(value)) return null
      if (input[j] === "%") {
        value /= 100
        j += 1
      }
      tokens.push({ type: "number", value })
      i = j
      continue
    }

    return null
  }

  return tokens
}

function toRpn(tokens: Token[]): Token[] | null {
  const output: Token[] = []
  const ops: Token[] = []

  for (const token of tokens) {
    if (token.type === "number") {
      output.push(token)
      continue
    }
    if (token.type === "op") {
      const meta = PRECEDENCE[token.value]
      while (ops.length) {
        const top = ops[ops.length - 1]
        if (top.type !== "op") break
        const topMeta = PRECEDENCE[top.value]
        const shouldPop = meta.right
          ? topMeta.prec > meta.prec
          : topMeta.prec >= meta.prec
        if (!shouldPop) break
        output.push(ops.pop() as Token)
      }
      ops.push(token)
      continue
    }
    if (token.type === "lparen") {
      ops.push(token)
      continue
    }
    while (ops.length && ops[ops.length - 1].type !== "lparen") {
      output.push(ops.pop() as Token)
    }
    if (!ops.length) return null
    ops.pop()
  }

  while (ops.length) {
    const op = ops.pop() as Token
    if (op.type === "lparen") return null
    output.push(op)
  }

  return output
}

function evalRpn(rpn: Token[]): number | null {
  const stack: number[] = []
  for (const token of rpn) {
    if (token.type === "number") {
      stack.push(token.value)
      continue
    }
    if (token.type !== "op") return null
    if (token.value === "u") {
      const a = stack.pop()
      if (a === undefined) return null
      stack.push(-a)
      continue
    }
    const b = stack.pop()
    const a = stack.pop()
    if (a === undefined || b === undefined) return null
    let next = 0
    switch (token.value) {
      case "+":
        next = a + b
        break
      case "-":
        next = a - b
        break
      case "*":
        next = a * b
        break
      case "/":
        if (b === 0) return null
        next = a / b
        break
      case "^":
        next = a ** b
        break
      default:
        return null
    }
    if (!Number.isFinite(next)) return null
    stack.push(next)
  }
  return stack.length === 1 ? stack[0] : null
}

export function evaluateExpression(source: string): {
  ok: true
  value: number
} | { ok: false; error: string } {
  const trimmed = source.trim()
  if (!trimmed) return { ok: false, error: "식을 입력해 주세요" }
  if (trimmed.length > 180) return { ok: false, error: "식이 너무 길어요" }

  const tokens = tokenize(trimmed)
  if (!tokens) return { ok: false, error: "숫자와 +, −, ×, ÷, %, 괄호만 사용할 수 있어요" }
  if (tokens.length === 0) return { ok: false, error: "식을 입력해 주세요" }

  const rpn = toRpn(tokens)
  if (!rpn) return { ok: false, error: "괄호를 확인해 주세요" }

  const value = evalRpn(rpn)
  if (value === null) return { ok: false, error: "식을 다시 확인해 주세요" }
  if (Math.abs(value) > 1e15) return { ok: false, error: "숫자가 너무 커요" }

  return { ok: true, value }
}
