"use client"

import { useId, useMemo, useState } from "react"
import { CalcShell } from "@/components/calc/calc-shell"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { Button } from "@/components/ui/button"
import type { CalcItem } from "@/lib/catalog"
import {
  clientRandom,
  clampLadderCount,
  defaultEndLabels,
  defaultStartLabels,
  generateRungs,
  ladderMapping,
  mappingCopyLine,
  resizeLabels,
  tracePath,
  type LadderRungs,
} from "@/lib/ladder"
import { cn } from "@/lib/utils"

const COUNT_OPTIONS = ["2", "3", "4", "5", "6", "7", "8"] as const
type CountKey = (typeof COUNT_OPTIONS)[number]

function pathD(
  start: number,
  rungs: LadderRungs,
  xs: number[],
  rowYs: number[],
  yTop: number,
  yBottom: number,
) {
  const cols = tracePath(start, rungs)
  const parts = [`M ${xs[cols[0]!]!.toFixed(1)} ${yTop}`]
  for (let r = 0; r < rungs.length; r++) {
    const y = rowYs[r]!
    const from = cols[r]!
    const to = cols[r + 1]!
    parts.push(`L ${xs[from]!.toFixed(1)} ${y.toFixed(1)}`)
    if (from !== to) parts.push(`L ${xs[to]!.toFixed(1)} ${y.toFixed(1)}`)
  }
  parts.push(`L ${xs[cols[cols.length - 1]!]!.toFixed(1)} ${yBottom}`)
  return parts.join(" ")
}

function LadderBoard({
  n,
  rungs,
  selected,
  onSelect,
  startLabels,
}: {
  n: number
  rungs: LadderRungs | null
  selected: number | null
  onSelect: (index: number) => void
  startLabels: string[]
}) {
  const vbW = 320
  const vbH = 280
  const padX = n >= 7 ? 12 : n >= 5 ? 18 : 28
  const yTop = 10
  const yBottom = 270
  const xs = Array.from({ length: n }, (_, i) =>
    n === 1 ? vbW / 2 : padX + (i * (vbW - 2 * padX)) / Math.max(1, n - 1),
  )
  const rowCount = rungs?.length ?? 0
  const rowYs = Array.from(
    { length: rowCount },
    (_, r) => yTop + ((r + 1) / (rowCount + 1)) * (yBottom - yTop),
  )
  const hitW = Math.min(36, (vbW - 2 * padX) / Math.max(1, n - 1))
  const endCol = selected !== null && rungs ? (tracePath(selected, rungs).at(-1) ?? selected) : null
  const rungKey = rungs?.map((row) => row.map(Number).join("")).join("|") ?? ""

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="h-auto w-full max-h-[min(52vh,22rem)]"
      role="img"
      aria-label="사다리"
    >
      {xs.map((x, i) => (
        <line
          key={`v-${i}`}
          x1={x}
          y1={yTop}
          x2={x}
          y2={yBottom}
          className="stroke-foreground/25"
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
      {rungs
        ? rungs.flatMap((row, r) =>
            row.flatMap((on, g) =>
              on
                ? [
                    <line
                      key={`h-${r}-${g}`}
                      x1={xs[g]}
                      y1={rowYs[r]}
                      x2={xs[g + 1]}
                      y2={rowYs[r]}
                      className="stroke-foreground/25"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />,
                  ]
                : [],
            ),
          )
        : null}
      {rungs && selected !== null ? (
        <path
          key={`${selected}-${rungKey}`}
          d={pathD(selected, rungs, xs, rowYs, yTop, yBottom)}
          pathLength={1}
          fill="none"
          className="ladder-trace stroke-primary"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      {xs.map((x, i) => (
        <g key={`ends-${i}`}>
          <circle
            cx={x}
            cy={yTop}
            r={selected === i ? 5 : 3.5}
            className={selected === i ? "fill-primary" : "fill-foreground/35"}
          />
          <circle
            cx={x}
            cy={yBottom}
            r={endCol === i ? 5 : 3.5}
            className={endCol === i ? "fill-primary" : "fill-foreground/35"}
          />
          <rect
            x={x - hitW / 2}
            y={0}
            width={hitW}
            height={vbH}
            fill="transparent"
            className="cursor-pointer"
            onClick={() => onSelect(i)}
          >
            <title>{`${startLabels[i] ?? i + 1} 경로`}</title>
          </rect>
        </g>
      ))}
    </svg>
  )
}

export function LadderCalc({ item }: { item: CalcItem }) {
  const fieldId = useId()
  const [count, setCount] = useState<CountKey>("4")
  const n = clampLadderCount(Number(count))
  const [starts, setStarts] = useState(() => defaultStartLabels(4))
  const [ends, setEnds] = useState(() => defaultEndLabels(4))
  const [rungs, setRungs] = useState<LadderRungs | null>(null)
  const [selected, setSelected] = useState<number | null>(null)

  const map = useMemo(() => (rungs ? ladderMapping(n, rungs) : null), [n, rungs])

  function setPeople(next: CountKey) {
    const nextN = clampLadderCount(Number(next))
    setCount(String(nextN) as CountKey)
    setStarts((prev) => resizeLabels(prev, nextN, (i) => defaultStartLabels(nextN)[i]!))
    setEnds((prev) => resizeLabels(prev, nextN, (i) => defaultEndLabels(nextN)[i]!))
    setRungs(null)
    setSelected(null)
  }

  function ride(selectIndex = 0) {
    const next = generateRungs(n, undefined, clientRandom)
    setRungs(next)
    setSelected(selectIndex)
  }

  const rows =
    map?.map((end, start) => ({
      label: starts[start] || defaultStartLabels(n)[start]!,
      value: ends[end] || defaultEndLabels(n)[end]!,
    })) ?? []

  const selectedLine =
    map && selected !== null
      ? `${starts[selected] || defaultStartLabels(n)[selected]} → ${ends[map[selected]!] || defaultEndLabels(n)[map[selected]!]}`
      : null

  return (
    <CalcShell
      item={item}
      result={
        <ResultReceipt
          title="누가 어디로"
          amount={map ? n : null}
          headline={selectedLine ?? (map ? `${n}명` : undefined)}
          caption={map ? "출발마다 도착이 하나씩" : undefined}
          rows={rows}
          empty="인원만 넣으면 사다리가 나옵니다."
          copyLine={map ? mappingCopyLine(starts, ends, map) : undefined}
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="인원"
          value={count}
          onChange={setPeople}
          options={COUNT_OPTIONS.map((value) => ({ value, label: `${value}명` }))}
        />

        <div className="space-y-1.5">
          <p className="text-sm font-medium">출발</p>
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
          >
            {starts.map((label, i) => (
              <label key={`${fieldId}-s-${i}`} className="min-w-0">
                <span className="sr-only">출발 {i + 1}</span>
                <input
                  value={label}
                  onChange={(event) => {
                    const value = event.target.value
                    setStarts((prev) => prev.map((item, idx) => (idx === i ? value : item)))
                  }}
                  onFocus={() => {
                    if (rungs) setSelected(i)
                  }}
                  className={cn(
                    "h-10 w-full min-w-0 rounded-xl border bg-transparent px-1 text-center outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    selected === i ? "border-primary" : "border-input",
                    n >= 7 ? "text-xs" : "text-sm",
                  )}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl bg-secondary/50 px-1 py-2">
          <LadderBoard
            n={n}
            rungs={rungs}
            selected={selected}
            onSelect={(index) => {
              if (!rungs) ride(index)
              else setSelected(index)
            }}
            startLabels={starts}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium">도착</p>
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
          >
            {ends.map((label, i) => (
              <label key={`${fieldId}-e-${i}`} className="min-w-0">
                <span className="sr-only">도착 {i + 1}</span>
                <input
                  value={label}
                  onChange={(event) => {
                    const value = event.target.value
                    setEnds((prev) => prev.map((item, idx) => (idx === i ? value : item)))
                  }}
                  className={cn(
                    "h-10 w-full min-w-0 rounded-xl border border-input bg-transparent px-1 text-center outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    map && selected !== null && map[selected] === i
                      ? "border-primary"
                      : "border-input",
                    n >= 7 ? "text-xs" : "text-sm",
                  )}
                />
              </label>
            ))}
          </div>
        </div>

        <Button type="button" className="h-11 w-full text-sm" onClick={() => ride(0)}>
          타기
        </Button>
        <p className="text-sm leading-6 text-muted-foreground">
          타기를 누르면 가로줄이 다시 놓입니다. 출발 이름이나 세로선을 누르면 그 줄이 어디로 가는지 보입니다.
        </p>
      </div>
    </CalcShell>
  )
}
