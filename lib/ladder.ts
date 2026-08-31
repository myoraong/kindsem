export const LADDER_MIN = 2
export const LADDER_MAX = 8
export const LADDER_ROWS = 10

const START_NAMES = ["가", "나", "다", "라", "마", "바", "사", "아"] as const

/** 가로줄 유무. rungs[줄][칸] — 칸 i 는 세로선 i 와 i+1 사이. */
export type LadderRungs = boolean[][]

export function clampLadderCount(n: number): number {
  if (!Number.isFinite(n)) return LADDER_MIN
  return Math.min(LADDER_MAX, Math.max(LADDER_MIN, Math.round(n)))
}

export function defaultStartLabels(n: number): string[] {
  const count = clampLadderCount(n)
  return Array.from({ length: count }, (_, i) => START_NAMES[i] ?? `사람${i + 1}`)
}

export function defaultEndLabels(n: number): string[] {
  const count = clampLadderCount(n)
  return Array.from({ length: count }, (_, i) => String(i + 1))
}

export function resizeLabels(current: string[], n: number, fallback: (index: number) => string): string[] {
  const count = clampLadderCount(n)
  return Array.from({ length: count }, (_, i) => {
    const prev = current[i]?.trim()
    return prev ? prev : fallback(i)
  })
}

export function clientRandom(): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return (buf[0] ?? 0) / 4294967296
  }
  return Math.random()
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const next = items.slice()
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const tmp = next[i]!
    next[i] = next[j]!
    next[j] = tmp
  }
  return next
}

export function hasAdjacentRungs(rungs: LadderRungs): boolean {
  for (const row of rungs) {
    for (let g = 1; g < row.length; g++) {
      if (row[g] && row[g - 1]) return true
    }
  }
  return false
}

/** 같은 높이에 이웃 가로줄이 붙지 않게 사다리를 만듭니다. */
export function generateRungs(
  n: number,
  rows = LADDER_ROWS,
  random: () => number = Math.random,
): LadderRungs {
  const count = clampLadderCount(n)
  const gaps = count - 1
  const out: LadderRungs = []
  for (let r = 0; r < rows; r++) {
    const row = Array<boolean>(gaps).fill(false)
    const order = shuffle(
      Array.from({ length: gaps }, (_, g) => g),
      random,
    )
    for (const g of order) {
      if ((g > 0 && row[g - 1]) || (g + 1 < gaps && row[g + 1])) continue
      if (random() < 0.65) row[g] = true
    }
    out.push(row)
  }
  return out
}

/** 각 가로줄 직후 칸. 길이 = 가로줄 수 + 1 (맨 위 출발 포함). */
export function tracePath(start: number, rungs: LadderRungs): number[] {
  const cols = [start]
  let col = start
  for (const row of rungs) {
    if (col > 0 && row[col - 1]) col -= 1
    else if (col < row.length && row[col]) col += 1
    cols.push(col)
  }
  return cols
}

export function followPath(start: number, rungs: LadderRungs): number {
  const cols = tracePath(start, rungs)
  return cols[cols.length - 1] ?? start
}

export function ladderMapping(n: number, rungs: LadderRungs): number[] {
  const count = clampLadderCount(n)
  return Array.from({ length: count }, (_, i) => followPath(i, rungs))
}

export function isPermutation(map: number[]): boolean {
  if (map.length === 0) return false
  const seen = new Set(map)
  if (seen.size !== map.length) return false
  return map.every((value) => Number.isInteger(value) && value >= 0 && value < map.length)
}

/** 첫 도착 칸만 당첨. 나머지는 끔. */
export function defaultPrizeMarks(n: number): boolean[] {
  const count = clampLadderCount(n)
  return Array.from({ length: count }, (_, i) => i === 0)
}

/** 인원이 줄어도 남은 당첨은 유지. 하나도 없으면 첫 칸. */
export function resizePrizeMarks(current: boolean[], n: number): boolean[] {
  const count = clampLadderCount(n)
  const next = Array.from({ length: count }, (_, i) => Boolean(current[i]))
  if (!next.some(Boolean)) next[0] = true
  return next
}

/** 당첨으로 표시한 도착으로 온 출발 인덱스. */
export function winningStarts(map: number[], prizes: boolean[]): number[] {
  return map.flatMap((end, start) => (prizes[end] ? [start] : []))
}

export function pairCopyLine(start: string, end: string): string {
  return `${start} → ${end}`
}

export function mappingCopyLine(starts: string[], ends: string[], map: number[]): string {
  return map
    .map((end, start) => pairCopyLine(starts[start] ?? String(start + 1), ends[end] ?? String(end + 1)))
    .join(" · ")
}
