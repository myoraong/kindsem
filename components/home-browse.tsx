"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { CalcDirRow } from "@/components/calc-card"
import { RealtyCatalog } from "@/components/realty-catalog"
import { Input } from "@/components/ui/input"
import { CALCULATORS, GROUPS } from "@/lib/catalog"
import { searchCalculators } from "@/lib/search"
import { useHomeSection } from "@/lib/use-home-section"
import { cn } from "@/lib/utils"

const JUMP = [
  { id: "today", label: "생활" },
  { id: "work", label: "급여" },
  { id: "realty", label: "부동산" },
] as const

export function HomeBrowse() {
  const router = useRouter()
  const section = useHomeSection()
  const [query, setQuery] = useState("")
  const results = useMemo(() => searchCalculators(query), [query])
  const searching = query.trim().length > 0
  const todayGroup = GROUPS.find((group) => group.id === "today")
  const workGroup = GROUPS.find((group) => group.id === "work")

  return (
    <>
      <form
        role="search"
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault()
          const first = results[0]
          if (first) router.push(`/calc/${first.slug}/`)
        }}
      >
        <label htmlFor="home-search" className="sr-only">
          계산기 검색
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="home-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="주휴수당, 취득세, DSR…"
            autoComplete="off"
            enterKeyHint="search"
            className="h-12 rounded-2xl bg-card pr-11 pl-10 text-base md:text-base"
          />
          {searching ? (
            <button
              type="button"
              aria-label="검색어 지우기"
              className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setQuery("")}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </form>

      {searching ? (
        <section className="mt-6" aria-live="polite">
          {results.length ? (
            <>
              <h2 className="mb-3 text-lg font-semibold">검색 {results.length}개</h2>
              <div className="grid gap-1 rounded-2xl bg-card p-2 ring-1 ring-foreground/8 sm:grid-cols-2">
                {results.map((item) => (
                  <CalcDirRow key={item.slug} item={item} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-card px-5 py-10 text-center ring-1 ring-foreground/8">
              <p className="text-sm font-medium">맞는 계산기가 없습니다</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                주휴, 복비, 양도세처럼 이름이나 상황을 짧게 넣어 보세요.
              </p>
            </div>
          )}
        </section>
      ) : (
        <>
          <nav
            aria-label="분류로 이동"
            className="sticky top-[4.25rem] z-20 -mx-4 mt-6 flex gap-2 overflow-x-auto bg-background/90 px-4 py-3 backdrop-blur-md"
          >
            {JUMP.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={item.id === section ? "true" : undefined}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-sm ring-1",
                  item.id === section
                    ? "bg-accent font-medium text-foreground ring-foreground/12"
                    : "bg-card ring-foreground/8 hover:bg-accent",
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-4">
            {section === "today" && todayGroup ? (
              <section id="today" className="scroll-mt-28">
                <h2 className="mb-3 text-lg font-semibold">{todayGroup.title}</h2>
                <div className="grid gap-1 rounded-2xl bg-card p-2 ring-1 ring-foreground/8 sm:grid-cols-2">
                  {CALCULATORS.filter((item) => item.group === "today").map((item) => (
                    <CalcDirRow key={item.slug} item={item} />
                  ))}
                </div>
              </section>
            ) : null}

            {section === "work" && workGroup ? (
              <section id="work" className="scroll-mt-28">
                <h2 className="mb-3 text-lg font-semibold">{workGroup.title}</h2>
                <div className="grid gap-1 rounded-2xl bg-card p-2 ring-1 ring-foreground/8 sm:grid-cols-2">
                  {CALCULATORS.filter((item) => item.group === "work").map((item) => (
                    <CalcDirRow key={item.slug} item={item} />
                  ))}
                </div>
              </section>
            ) : null}

            {section === "realty" ? (
              <section id="realty" className="scroll-mt-28">
                <h2 className="mb-3 text-lg font-semibold">부동산</h2>
                <RealtyCatalog />
              </section>
            ) : null}
          </div>
        </>
      )}
    </>
  )
}
