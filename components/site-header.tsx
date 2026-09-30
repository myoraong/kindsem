"use client"

import Link from "next/link"
import { HeaderSearch } from "@/components/header-search"
import { Moon, Sun } from "lucide-react"
import { BrandLink } from "@/components/brand-mark"
import { RealtyMenu } from "@/components/realty-menu"
import { TodayMenu } from "@/components/today-menu"
import { WorkMenu } from "@/components/work-menu"
import { toggleTheme } from "@/lib/theme"

export function SiteHeader() {
  return (
    <header
      data-site-header
      className="sticky top-0 z-30 overflow-visible border-b border-border bg-background/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-[var(--site-header-h)] max-w-5xl items-center gap-0.5 overflow-visible px-2.5 sm:gap-2 sm:px-4">
        <BrandLink />
        <nav aria-label="계산 분류" className="ml-auto flex min-w-0 items-center gap-0 text-sm sm:gap-0.5">
          <TodayMenu />
          <WorkMenu />
          <RealtyMenu />
          <Link
            href="/guide/"
            className="shrink-0 rounded-xl px-2 py-1 text-[13px] font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            읽어 두기
          </Link>
        </nav>
        <HeaderSearch />
        <button
          type="button"
          aria-label="색감 바꾸기"
          className="grid size-9 shrink-0 place-items-center rounded-xl text-foreground hover:bg-muted"
          onClick={toggleTheme}
        >
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </button>
      </div>
    </header>
  )
}
