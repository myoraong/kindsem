"use client"

import { useMemo, useState } from "react"
import { RotateCcw } from "lucide-react"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { kakaoCopyLine } from "@/lib/format"
import {
  DEFAULT_ENDS,
  DEFAULT_STARTS,
  followColumn,
  LADDER_MAX,
  LADDER_MIN,
  LADDER_ROWS,
  ladderMap,
  makeRungs,
  seededRandom,
  type Rungs,
} from "@/lib/ladder"
import type { CalcItem } from "@/lib/catalog"
import { cn } from "@/lib/utils"

const PAD_X = 22
const PAD_Y = 18
const HEIGHT = 280

const FAQ = [
  {
    q: "가로줄이 붙나요?",
    a: "같은 줄에서 이웃한 가로줄은 두지 않습니다. 한 칸을 두 가로줄이 동시에 가로지르지 않습니다.",
  },
  {
    q: "같은 칸에 두 명이 모이나요?",
    a: "위 칸마다 아래 칸 하나가 이어집니다. 같은 아래 칸에 두 줄이 겹치지 않습니다.",
  },
  {
    q: "인원은 몇 명까지인가요?",
    a: "2명부터 8명까지입니다. 위·아래 칸 글자는 직접 바꿀 수 있습니다.",
  },
]

export function LadderCalc({ item }: { item: CalcItem }) {
  const [people, setPeople] = useState("4")
  const [starts, setStarts] = useState(() => [...DEFAULT_STARTS])
  const [ends, setEnds] = useState(() => [...DEFAULT_ENDS])
  const [seed, setSeed] = useState(20260831)
  const [picked, setPicked] = useState<number | null>(null)

  const n = clampCount(Number(people))
  const rungs = useMemo(() => makeRungs(n, seededRandom(seed)), [n, seed])
  const map = useMemo(() => ladderMap(rungs), [rungs])

  const width = Math.max(240, n * 68)
  const colX = (i: number) => PAD_X + (i * (width - PAD_X * 2)) / Math.max(1, n - 1)
  const rowY = (row: number) => PAD_Y + (row * (HEIGHT - PAD_Y * 2)) / (LADDER_ROWS - 1)

  const destination = picked == null ? null : followColumn(picked, rungs)
  const path = picked == null ? [] : pathPoints(picked, rungs, colX, rowY)

  const startLabel = (i: number) => starts[i]?.trim() || `${i + 1}번`
  const endLabel = (i: number) => ends[i]?.trim() || `${i + 1}번`

  function setStartLabel(i: number, value: string) {
    setStarts((prev) => {
      const next = [...prev]
      next[i] = value
      return next
    })
  }

  function setEndLabel(i: number, value: string) {
    setEnds((prev) => {
      const next = [...prev]
      next[i] = value
      return next
    })
  }

  function ride() {
    setSeed((s) => (s + 0x9e3779b9) >>> 0)
    setPicked(null)
  }

  const rows = Array.from({ length: n }, (_, i) => ({
    label: startLabel(i),
    value: endLabel(map[i] ?? i),
  }))

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="누가 → 어디"
          amount={null}
          headline={picked == null || destination == null ? undefined : endLabel(destination)}
          caption={
            picked == null || destination == null
              ? undefined
              : `${startLabel(picked)} → ${endLabel(destination)}`
          }
          copyLine={
            picked == null || destination == null
              ? undefined
              : kakaoCopyLine("사다리타기", `${startLabel(picked)} → ${endLabel(destination)}`)
          }
          rows={picked == null ? [] : rows}
          empty="인원만 넣으면 사다리가 나옵니다. 위 칸을 누르면 그 줄이 어디로 가는지 보입니다."
        />
      }
    >
      <div className="space-y-4">
        <MoneyField
          id="ladder-count"
          label="인원"
          unit="명"
          value={people}
          onChange={(value) => {
            setPeople(value)
            setPicked(null)
          }}
          hint="2명부터 8명까지"
        />
        <Button type="button" className="h-10 w-full" onClick={ride}>
          <RotateCcw className="size-4" />
          타기
        </Button>

        <div className="-mx-1 overflow-x-auto">
          <div className="mx-auto min-w-[240px]" style={{ width }}>
            <div className="mb-1 flex justify-between gap-1">
              {Array.from({ length: n }, (_, i) => (
                <Input
                  key={`s-${i}`}
                  aria-label={`위 ${i + 1}번`}
                  value={starts[i] ?? ""}
                  onChange={(e) => setStartLabel(i, e.target.value)}
                  onFocus={() => setPicked(i)}
                  onClick={() => setPicked(i)}
                  className={cn(
                    "h-9 min-w-0 flex-1 px-1 text-center text-sm",
                    picked === i && "border-primary ring-2 ring-primary/30",
                  )}
                />
              ))}
            </div>
            <svg
              viewBox={`0 0 ${width} ${HEIGHT}`}
              width="100%"
              height={HEIGHT}
              role="img"
              aria-label="사다리"
              className="block"
            >
              {Array.from({ length: n }, (_, i) => (
                <line
                  key={`v-${i}`}
                  x1={colX(i)}
                  y1={PAD_Y}
                  x2={colX(i)}
                  y2={HEIGHT - PAD_Y}
                  stroke="var(--border)"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              ))}
              {rungs.flatMap((row, rowIndex) =>
                row.flatMap((on, between) =>
                  on ? (
                    <line
                      key={`r-${rowIndex}-${between}`}
                      x1={colX(between)}
                      y1={rowY(rowIndex)}
                      x2={colX(between + 1)}
                      y2={rowY(rowIndex)}
                      stroke="var(--border)"
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                  ) : (
                    []
                  ),
                ),
              )}
              {path.length > 1 ? (
                <polyline
                  key={`${seed}-${picked}`}
                  className="ladder-trace"
                  points={path.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                />
              ) : null}
            </svg>
            <div className="mt-1 flex justify-between gap-1">
              {Array.from({ length: n }, (_, i) => (
                <Input
                  key={`e-${i}`}
                  aria-label={`아래 ${i + 1}번`}
                  value={ends[i] ?? ""}
                  onChange={(e) => setEndLabel(i, e.target.value)}
                  className={cn(
                    "h-9 min-w-0 flex-1 px-1 text-center text-sm",
                    destination === i && "border-primary ring-2 ring-primary/30",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </CalcShell>
  )
}

function clampCount(value: number) {
  if (!Number.isFinite(value)) return 4
  return Math.min(LADDER_MAX, Math.max(LADDER_MIN, Math.floor(value)))
}

function pathPoints(
  start: number,
  rungs: Rungs,
  colX: (i: number) => number,
  rowY: (row: number) => number,
): { x: number; y: number }[] {
  const n = rungs[0] ? rungs[0].length + 1 : 0
  const points: { x: number; y: number }[] = [{ x: colX(start), y: PAD_Y }]
  let col = start
  for (let row = 0; row < rungs.length; row++) {
    const y = rowY(row)
    points.push({ x: colX(col), y })
    const line = rungs[row] ?? []
    if (col < n - 1 && line[col]) {
      points.push({ x: colX(col + 1), y })
      col += 1
    } else if (col > 0 && line[col - 1]) {
      points.push({ x: colX(col - 1), y })
      col -= 1
    }
  }
  points.push({ x: colX(col), y: HEIGHT - PAD_Y })
  return points
}
