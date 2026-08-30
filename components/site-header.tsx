"use client"

import Link from "next/link"
import { Moon, Sun } from "lucide-react"
import { BrandLink } from "@/components/brand-mark"
import { GROUPS } from "@/lib/catalog"
import { toggleTheme } from "@/lib/theme"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-5xl items-center gap-3 px-4">
        <BrandLink />
        <nav
          aria-label="계산 분류"
          className="ml-auto flex min-w-0 items-center gap-0.5 overflow-x-auto text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {GROUPS.map((group) => (
            <Link
              key={group.id}
              href={`/#${group.id}`}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {group.title}
            </Link>
          ))}
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
