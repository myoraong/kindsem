"use client"

import Link from "next/link"
import { Sena } from "@/components/sena"

export function BrandMark() {
  return (
    <span className="flex items-center gap-2 sm:gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-card ring-1 ring-primary/40 sm:size-9">
        <Sena variant="face" className="size-[2.35rem] object-cover sm:size-11" priority />
      </span>
      <span className="flex min-w-0 flex-col justify-center leading-none">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-bold tracking-[-0.05em] [font-variant-numeric:tabular-nums]">
            Kindsem
          </span>
          <span className="hidden text-[11px] font-medium tracking-tight text-muted-foreground sm:inline">
            카인드셈
          </span>
        </span>
        <span className="mt-0.5 hidden text-[11px] font-medium tracking-[0.02em] text-muted-foreground sm:block">
          생활 계산기
        </span>
      </span>
    </span>
  )
}

export function BrandLink() {
  return (
    <Link
      href="/#all"
      aria-label="Kindsem 카인드셈 생활 계산기"
      className="shrink-0 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      onClick={(event) => {
        const path = window.location.pathname
        if (path !== "/" && path !== "") return
        event.preventDefault()
        if (window.location.hash) {
          history.pushState(null, "", `${path}${window.location.search}`)
        }
        window.scrollTo({ top: 0 })
      }}
    >
      <BrandMark />
    </Link>
  )
}
