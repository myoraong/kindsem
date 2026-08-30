"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { allRealtyItems, isRealtySlug } from "@/lib/realty"
import { cn } from "@/lib/utils"

export function RealtyMenu() {
  const pathname = usePathname()
  const openId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const parts = pathname.split("/").filter(Boolean)
  const onRealty =
    parts[0] === "realty" || (parts[0] === "calc" && isRealtySlug(parts[1] ?? ""))
  const items = allRealtyItems()

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onPointer)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/realty"
        aria-expanded={open}
        aria-controls={openId}
        className={cn(
          "inline-flex h-[4.25rem] items-center border-b-2 px-2 text-sm whitespace-nowrap transition-colors sm:px-2.5",
          onRealty || open
            ? "border-primary font-medium text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
        onClick={() => setOpen(false)}
        onFocus={() => setOpen(true)}
      >
        부동산
      </Link>
      {open ? (
        <div
          id={openId}
          className="absolute top-full right-0 z-40 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-card p-3 shadow-lg ring-1 ring-foreground/10 sm:p-4"
        >
          <ul className="max-h-[min(20rem,calc(100dvh-5.75rem))] space-y-0.5 overflow-y-auto overscroll-contain">
            {items.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/calc/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm hover:bg-muted"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{item.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
