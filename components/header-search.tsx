"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { popularCalculators } from "@/lib/popular-calcs"
import { closeNavMenu } from "@/lib/nav-menu-open"
import { searchCalculators } from "@/lib/search"
import { calcPath, calcSeo } from "@/lib/seo"
import { cn } from "@/lib/utils"

export function HeaderSearch() {
  const router = useRouter()
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const searching = query.trim().length > 0
  const results = useMemo(() => searchCalculators(query, "all"), [query])
  const popular = popularCalculators()
  const list = searching ? results : popular

  function close() {
    setOpen(false)
    setQuery("")
  }

  function go(slug: string) {
    close()
    router.push(calcPath(slug))
  }

  useEffect(() => {
    if (!open) return
    closeNavMenu()
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close()
    }
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close()
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="계산기 검색"
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl text-foreground hover:bg-muted sm:size-9",
          open && "bg-muted",
        )}
        onClick={() => {
          if (open) close()
          else setOpen(true)
        }}
      >
        <Search className="size-4" />
      </button>
      {open ? (
        <div
          id={panelId}
          className="fixed top-[calc(var(--site-header-h)+0.4rem)] right-3 left-3 z-50 rounded-2xl bg-card p-3 shadow-lg ring-1 ring-foreground/10 sm:absolute sm:top-[calc(100%+0.35rem)] sm:left-auto sm:w-80"
        >
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              const first = list[0]
              if (first) go(first.slug)
            }}
          >
            <label htmlFor="header-search" className="sr-only">
              계산기 검색
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                id="header-search"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="실수령액, 복비, 취득세…"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                enterKeyHint="search"
                inputMode="search"
                className="h-11 rounded-xl pr-10 pl-9 text-base sm:h-10"
              />
              {searching ? (
                <button
                  type="button"
                  aria-label="검색어 지우기"
                  className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setQuery("")}
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          </form>
          <p className="mt-2 px-1 text-[11px] text-muted-foreground">
            {searching ? (list.length ? `검색 ${list.length}개` : "맞는 계산기가 없습니다") : "자주 찾는 계산기"}
          </p>
          {list.length ? (
            <ul className="mt-1 max-h-[min(16rem,50dvh)] space-y-0.5 overflow-y-auto overscroll-contain">
              {list.map((item) => (
                <li key={item.slug}>
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center rounded-xl px-2.5 py-2.5 text-left text-sm hover:bg-muted"
                    onClick={() => go(item.slug)}
                  >
                    <span className="font-medium">{calcSeo(item.slug).query}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2.5 py-3 text-sm text-muted-foreground">주휴, 복비처럼 짧게 넣어 보세요.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
