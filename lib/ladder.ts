export const LADDER_MIN = 2
export const LADDER_MAX = 8
export const LADDER_ROWS = 11

/** [row][i] = 세로줄 i와 i+1 사이 가로대. 같은 칸에서 이웃 가로대는 붙지 않습니다. */
export type Rungs = boolean[][]

/** 같은 씨앗이면 같은 사다리가 나옵니다. */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function makeRungs(count: number, rng: () => number = Math.random): Rungs {
  const n = Math.min(LADDER_MAX, Math.max(LADDER_MIN, Math.floor(count)))
  const rungs: Rungs = []
  for (let row = 0; row < LADDER_ROWS; row++) {
    const line = Array.from({ length: n - 1 }, () => false)
    for (let i = 0; i < n - 1; i++) {
      if (i > 0 && line[i - 1]) continue
      line[i] = rng() < 0.42
    }
    rungs.push(line)
  }
  return rungs
}

export function followColumn(start: number, rungs: Rungs): number {
  if (rungs.length === 0) return start
  const n = rungs[0].length + 1
  let col = start
  for (const row of rungs) {
    if (col < n - 1 && row[col]) col += 1
    else if (col > 0 && row[col - 1]) col -= 1
  }
  return col
}

/** 출발 칸 → 도착 칸. 한 칸에 두 명이 모이지 않습니다. */
export function ladderMap(rungs: Rungs): number[] {
  if (rungs.length === 0) return []
  const n = rungs[0].length + 1
  return Array.from({ length: n }, (_, i) => followColumn(i, rungs))
}

export function isPermutation(map: number[]): boolean {
  if (map.length === 0) return false
  const seen = new Set(map)
  return seen.size === map.length && map.every((x) => Number.isInteger(x) && x >= 0 && x < map.length)
}

export function rungsNeighborOk(rungs: Rungs): boolean {
  for (const row of rungs) {
    for (let i = 1; i < row.length; i++) {
      if (row[i] && row[i - 1]) return false
    }
  }
  return true
}

export const DEFAULT_STARTS = ["가", "나", "다", "라", "마", "바", "사", "아"] as const
export const DEFAULT_ENDS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const
