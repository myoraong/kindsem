"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { CalcShell } from "@/components/calc/calc-shell"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { Button } from "@/components/ui/button"
import type { CalcItem } from "@/lib/catalog"
import {
  clientRandom,
  clampLadderCount,
  defaultEndLabels,
  defaultStartLabels,
  generateRungs,
  ladderMapping,
  pairCopyLine,
  resizeLabels,
  tracePath,
  type LadderRungs,
} from "@/lib/ladder"
import { cn } from "@/lib/utils"

const COUNT_OPTIONS = ["2", "3", "4", "5", "6", "7", "8"] as const
type CountKey = (typeof COUNT_OPTIONS)[number]

/** 가로줄 따라 내려가는 시간과 CSS .ladder-trace 길이를 맞춥니다. */
const TRACE_MS = 1450

const ghostTextBtn =
  "inline-flex h-8 shrink-0 items-center rounded-md px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"

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

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function ClimbPath({
  d,
  playId,
  token,
  strokeWidth,
}: {
  d: string
  playId: number
  token: boolean
  strokeWidth: number
}) {
  const pathRef = useRef<SVGPathElement>(null)
  const tokenRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const path = pathRef.current
    const dot = tokenRef.current
    if (!path) return

    let raf = 0
    let cancelled = false

    const play = () => {
      if (cancelled) return
      const len = path.getTotalLength()
      if (len === 0) {
        raf = requestAnimationFrame(play)
        return
      }
      const startPt = path.getPointAtLength(0)
      if (dot) {
        dot.setAttribute("cx", String(startPt.x))
        dot.setAttribute("cy", String(startPt.y))
        dot.setAttribute("opacity", "1")
      }
      path.style.strokeDasharray = String(len)
      if (prefersReducedMotion()) {
        path.style.strokeDashoffset = "0"
        if (dot) {
          const end = path.getPointAtLength(len)
          dot.setAttribute("cx", String(end.x))
          dot.setAttribute("cy", String(end.y))
        }
        return
      }
      path.style.strokeDashoffset = String(len)
      const t0 = performance.now()
      const tick = (now: number) => {
        if (cancelled) return
        const t = Math.min(1, (now - t0) / TRACE_MS)
        const eased = 1 - (1 - t) ** 3
        const p = path.getPointAtLength(len * eased)
        if (dot) {
          dot.setAttribute("cx", String(p.x))
          dot.setAttribute("cy", String(p.y))
        }
        path.style.strokeDashoffset = String(len * (1 - eased))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(play)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [playId, d, token])

  return (
    <g>
      <path
        ref={pathRef}
        d={d}
        fill="none"
        className="stroke-primary"
        style={{ strokeDasharray: 800, strokeDashoffset: 800 }}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {token ? (
        <circle
          ref={tokenRef}
          r={strokeWidth > 3 ? 6 : 5}
          opacity={0}
          className="fill-primary stroke-background"
          strokeWidth={2}
        />
      ) : null}
    </g>
  )
}

function LadderBoard({
  n,
  rungs,
  selected,
  playId,
  onSelect,
  startLabels,
}: {
  n: number
  rungs: LadderRungs | null
  selected: number | null
  playId: number
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
  const climbers =
    rungs == null ? [] : selected === null ? Array.from({ length: n }, (_, i) => i) : [selected]
  const endCols = new Set(
    rungs ? climbers.map((start) => tracePath(start, rungs).at(-1) ?? start) : [],
  )
  const many = climbers.length > 1

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
      {rungs
        ? climbers.map((start) => (
            <ClimbPath
              key={`${playId}-${start}`}
              d={pathD(start, rungs, xs, rowYs, yTop, yBottom)}
              playId={playId}
              token
              strokeWidth={many ? 2.6 : 3.2}
            />
          ))
        : null}
      {xs.map((x, i) => (
        <g key={`ends-${i}`}>
          <circle
            cx={x}
            cy={yTop}
            r={climbers.includes(i) ? 5 : 3.5}
            className={climbers.includes(i) ? "fill-primary" : "fill-foreground/35"}
          />
          <circle
            cx={x}
            cy={yBottom}
            r={endCols.has(i) ? 5 : 3.5}
            className={endCols.has(i) ? "fill-primary" : "fill-foreground/35"}
          />
        </g>
      ))}
      {xs.map((x, i) => (
        <rect
          key={`hit-${i}`}
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
      ))}
    </svg>
  )
}

function LadderResult({
  rows,
  selected,
  hasBoard,
  onSelect,
  onRemove,
  onClear,
}: {
  rows: { start: number; line: string; label: string; value: string }[]
  selected: number | null
  hasBoard: boolean
  onSelect: (start: number) => void
  onRemove: (start: number) => void
  onClear: () => void
}) {
  const selectedRow = selected === null ? null : (rows.find((row) => row.start === selected) ?? null)
  const allLine = rows.map((row) => row.line).join(" · ")

  async function copyLine(line: string) {
    await navigator.clipboard.writeText(line)
    toast.success("복사됨")
  }

  return (
    <aside className="paper-rule rounded-2xl bg-card p-5 ring-1 ring-foreground/8 md:sticky md:top-20">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">누가 어디로</p>
        <button
          type="button"
          disabled={!hasBoard || rows.length === 0}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          onClick={onClear}
        >
          <Trash2 className="size-3.5" />
          모두 지우기
        </button>
      </div>

      {!hasBoard ? (
        <p className="mt-6 text-sm leading-6 text-muted-foreground">인원만 넣으면 사다리가 나옵니다.</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm leading-6 text-muted-foreground">
          목록을 지웠습니다. 타기를 누르면 다시 나옵니다.
        </p>
      ) : (
        <>
          <div className="mt-4 rounded-xl bg-secondary/70 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">{selectedRow ? "지금" : "전체"}</p>
              <button
                type="button"
                className={ghostTextBtn}
                aria-label="복사"
                onClick={() => copyLine(selectedRow ? selectedRow.line : allLine)}
              >
                복사
              </button>
            </div>
            {selectedRow ? (
              <p className="mt-1 text-2xl font-semibold tracking-tight">{selectedRow.line}</p>
            ) : (
              <ul className="mt-1 space-y-1">
                {rows.map((row) => (
                  <li key={row.start} className="text-lg font-semibold tracking-tight">
                    {row.line}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1 text-xs text-muted-foreground">출발마다 도착이 하나씩</p>
          </div>
          <div className="mt-4 space-y-1 border-t border-dashed border-border pt-3">
            {rows.map((row) => (
              <div
                key={row.start}
                className={cn(
                  "flex items-center gap-1 rounded-lg py-0.5 pl-1 hover:bg-muted/70",
                  selected === row.start && "bg-muted/70",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(row.start)}
                  className="min-w-0 flex-1 py-1.5 text-left text-sm"
                >
                  <span className="block truncate text-muted-foreground">{row.label}</span>
                  <span className="tabular font-medium">{row.value}</span>
                </button>
                <button
                  type="button"
                  className={ghostTextBtn}
                  aria-label="복사"
                  onClick={() => copyLine(row.line)}
                >
                  복사
                </button>
                <button
                  type="button"
                  className={ghostTextBtn}
                  aria-label="삭제"
                  onClick={() => onRemove(row.start)}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
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
  const [hidden, setHidden] = useState<Set<number>>(() => new Set())
  const [playId, setPlayId] = useState(0)

  const map = useMemo(() => (rungs ? ladderMapping(n, rungs) : null), [n, rungs])

  function replay(index: number) {
    setHidden((prev) => {
      if (!prev.has(index)) return prev
      const next = new Set(prev)
      next.delete(index)
      return next
    })
    setSelected(index)
    setPlayId((id) => id + 1)
  }

  function setPeople(next: CountKey) {
    const nextN = clampLadderCount(Number(next))
    setCount(String(nextN) as CountKey)
    setStarts((prev) => resizeLabels(prev, nextN, (i) => defaultStartLabels(nextN)[i]!))
    setEnds((prev) => resizeLabels(prev, nextN, (i) => defaultEndLabels(nextN)[i]!))
    setRungs(null)
    setSelected(null)
    setHidden(new Set())
  }

  function ride() {
    setRungs(generateRungs(n, undefined, clientRandom))
    setHidden(new Set())
    setSelected(null)
    setPlayId((id) => id + 1)
  }

  function startFrom(index: number) {
    if (!rungs) {
      setRungs(generateRungs(n, undefined, clientRandom))
      setHidden(new Set())
    }
    replay(index)
  }

  function removeRow(start: number) {
    const nextHidden = new Set(hidden)
    nextHidden.add(start)
    setHidden(nextHidden)
    if (selected === start) {
      const rest = Array.from({ length: n }, (_, i) => i).filter((i) => !nextHidden.has(i))
      setSelected(rest[0] ?? null)
    }
  }

  const rows =
    map
      ?.map((end, start) => {
        const label = starts[start] || defaultStartLabels(n)[start]!
        const value = ends[end] || defaultEndLabels(n)[end]!
        return { start, label, value, line: pairCopyLine(label, value) }
      })
      .filter((row) => !hidden.has(row.start)) ?? []

  return (
    <CalcShell
      item={item}
      result={
        <LadderResult
          rows={rows}
          selected={selected}
          hasBoard={Boolean(map)}
          onSelect={replay}
          onRemove={removeRow}
          onClear={() => {
            setHidden(new Set(Array.from({ length: n }, (_, i) => i)))
            setSelected(null)
          }}
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
                    if (rungs) replay(i)
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
            playId={playId}
            onSelect={startFrom}
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

        <Button type="button" className="h-11 w-full text-sm" onClick={ride}>
          타기
        </Button>
        <p className="text-sm leading-6 text-muted-foreground">
          타기를 누르면 모두 타고, 누가 어디로인지 한꺼번에 나옵니다. 출발 이름이나 세로선을 누르면 그 줄만 다시 타입니다.
        </p>
      </div>
    </CalcShell>
  )
}
