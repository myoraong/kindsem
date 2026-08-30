"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Item = { slug: string; title: string; blurb: string }

const EDGE = 8

export function NavMenu({
  href,
  label,
  active,
  items,
  align = "left",
  onNavigate,
}: {
  href: string
  label: string
  active: boolean
  items: Item[]
  align?: "left" | "right"
  onNavigate?: () => void
}) {
  const openId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  function keepInView() {
    const el = panelRef.current
    if (!el) return
    el.style.transform = ""
    const rect = el.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    let dx = 0
    if (rect.right > vw - EDGE) dx = vw - EDGE - rect.right
    if (rect.left + dx < EDGE) dx = EDGE - rect.left
    el.style.transform = dx ? `translateX(${dx}px)` : ""
  }

  useLayoutEffect(() => {
    if (!open) return
    keepInView()
    window.addEventListener("resize", keepInView)
    return () => window.removeEventListener("resize", keepInView)
  }, [open, items])

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
        href={href}
        aria-expanded={open}
        aria-controls={openId}
        className={cn(
          "inline-flex h-[4.25rem] items-center border-b-2 px-2 text-sm whitespace-nowrap transition-colors sm:px-2.5",
          active || open
            ? "border-primary font-medium text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
        onClick={() => {
          setOpen(false)
          onNavigate?.()
        }}
        onFocus={() => setOpen(true)}
      >
        {label}
      </Link>
      {open ? (
        <div
          ref={panelRef}
          id={openId}
          className={cn(
            "absolute top-full z-40 w-[min(18rem,calc(100vw-1rem))] overflow-hidden rounded-2xl bg-card p-3 shadow-lg ring-1 ring-foreground/10 sm:p-4",
            align === "right" ? "right-0" : "left-0",
          )}
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
