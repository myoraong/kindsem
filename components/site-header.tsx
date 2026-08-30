"use client"

import { Moon, Sun } from "lucide-react"
import { BrandLink } from "@/components/brand-mark"
import { RealtyMenu } from "@/components/realty-menu"
import { TodayMenu } from "@/components/today-menu"
import { WorkMenu } from "@/components/work-menu"
import { toggleTheme } from "@/lib/theme"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 overflow-visible border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-5xl items-center gap-1 overflow-visible px-4 sm:gap-3">
        <BrandLink />
        <nav aria-label="계산 분류" className="ml-auto flex min-w-0 items-center gap-0 text-sm sm:gap-0.5">
          <TodayMenu />
          <WorkMenu />
          <RealtyMenu />
        </nav>
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
