"use client"

import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { CalcDirRow } from "@/components/calc-card"
import { HomeQuickCalc } from "@/components/home-quick-calc"
import { PopularCalcs } from "@/components/popular-calcs"
import { RecentCalcs } from "@/components/recent-calcs"
import { RealtyCatalog } from "@/components/realty-catalog"
import { Input } from "@/components/ui/input"
import { CALCULATORS, CATALOG_HEADINGS } from "@/lib/catalog"
import { searchCalculators } from "@/lib/search"
import { rememberBackSection } from "@/lib/home-back"
import { homeChipClass } from "@/lib/home-section"
import { calcPath } from "@/lib/seo"
import {
  HOME_SECTION_SCROLL_MARGIN_CLASS,
  goHomeSection,
  homeSectionToSnap,
  snapHomeSection,
} from "@/lib/home-section-snap"
import { useHomeSection } from "@/lib/use-home-section"
import { cn } from "@/lib/utils"

const JUMP = [
  { id: "all", label: "전체" },
  { id: "today", label: "생활" },
  { id: "work", label: "급여" },
  { id: "realty", label: "부동산" },
] as const

function CategoryJump({
  section,
  flush = false,
}: {
  section: ReturnType<typeof useHomeSection>
  flush?: boolean
}) {
  return (
    <nav
      data-home-jump
      aria-label="계산 분류"
      className={cn(
        "sticky top-[var(--site-header-h)] z-20 flex flex-wrap gap-2 bg-background/90 backdrop-blur-md",
        flush ? "py-1" : "-mx-4 mt-6 px-4 pt-4 pb-3",
      )}
    >
      {JUMP.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={item.id === section ? "true" : undefined}
          className={cn(
            "inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-sm ring-1",
            homeChipClass(item.id, section),
          )}
          onClick={(event) => {
            event.preventDefault()
            goHomeSection(item.id)
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}

function CatalogSectionHeading({ title, blurb }: { title: string; blurb: string }) {
  return (
    <header className="mb-2.5 min-w-0">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{title}</h2>
      <p className="mt-0.5 max-w-2xl text-pretty break-keep text-sm leading-6 text-muted-foreground">
        {blurb}
      </p>
    </header>
  )
}

export function HomeBrowse() {
  const router = useRouter()
  const section = useHomeSection()
  const [query, setQuery] = useState("")
  const results = useMemo(() => searchCalculators(query, section), [query, section])
  const searching = query.trim().length > 0
  const sectionClass = cn(
    HOME_SECTION_SCROLL_MARGIN_CLASS,
    section !== "all" && "min-h-[calc(100dvh-var(--site-header-h)-4.75rem)]",
  )

  useLayoutEffect(() => {
    if (searching) return
    const next = homeSectionToSnap(window.location.hash)
    if (!next || next !== section) return
    snapHomeSection(next)
  }, [section, searching])

  useEffect(() => {
    rememberBackSection(section)
  }, [section])

  return (
    <>
      <form
        role="search"
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault()
          const first = results[0]
          if (first) router.push(calcPath(first.slug))
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
            placeholder="실수령액 계산기, 퇴직금, 복비…"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            enterKeyHint="search"
            inputMode="search"
            className="h-12 rounded-2xl bg-card pr-11 pl-10 text-base"
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

      {!searching ? (
        <div className="mt-6 grid md:grid-cols-[minmax(0,1fr)_23.5rem] md:items-stretch md:gap-x-6">
          <div className="flex min-w-0 flex-col gap-5">
            <PopularCalcs from={section} />
            <RecentCalcs from={section} />
            <CategoryJump section={section} flush />
            <div className="md:hidden">
              <HomeQuickCalc folded />
            </div>
          </div>
          <div className="hidden h-full w-full min-h-0 md:flex">
            <HomeQuickCalc />
          </div>
        </div>
      ) : (
        <CategoryJump section={section} />
      )}

      {searching ? (
        <section className="mt-4" aria-live="polite">
          {results.length ? (
            <>
              <h2 className="mb-3 text-lg font-semibold">검색 {results.length}개</h2>
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-card p-2 ring-1 ring-foreground/8">
                {results.map((item) => (
                  <CalcDirRow key={item.slug} item={item} from={section} />
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl bg-card px-5 py-10 text-center ring-1 ring-foreground/8">
                <p className="text-sm font-medium">맞는 계산기가 없습니다</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  주휴, 복비, 양도세처럼 이름이나 상황을 짧게 넣어 보세요.
                </p>
              </div>
              <PopularCalcs from={section} />
            </div>
          )}
        </section>
      ) : (
        <div className="mt-4 space-y-8">
          {section === "all" || section === "today" ? (
            <section id="today" className={sectionClass}>
              <CatalogSectionHeading {...CATALOG_HEADINGS.today} />
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-card p-2 ring-1 ring-foreground/8">
                {CALCULATORS.filter((item) => item.group === "today").map((item) => (
                  <CalcDirRow key={item.slug} item={item} from={section} />
                ))}
              </div>
            </section>
          ) : null}

          {section === "all" || section === "work" ? (
            <section id="work" className={sectionClass}>
              <CatalogSectionHeading {...CATALOG_HEADINGS.work} />
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-card p-2 ring-1 ring-foreground/8">
                {CALCULATORS.filter((item) => item.group === "work").map((item) => (
                  <CalcDirRow key={item.slug} item={item} from={section} />
                ))}
              </div>
            </section>
          ) : null}

          {section === "all" || section === "realty" ? (
            <section id="realty" className={sectionClass}>
              <CatalogSectionHeading {...CATALOG_HEADINGS.realty} />
              <RealtyCatalog from={section} />
            </section>
          ) : null}
        </div>
      )}
    </>
  )
}
