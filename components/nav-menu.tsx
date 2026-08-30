"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
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
  const [box, setBox] = useState({ top: 0, left: 0, width: 288 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function place() {
    const trigger = rootRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const width = Math.min(288, vw - EDGE * 2)
    let left = align === "right" ? rect.right - width : rect.left
    if (left + width > vw - EDGE) left = vw - EDGE - width
    if (left < EDGE) left = EDGE
    setBox({ top: rect.bottom, left, width })
  }

  useLayoutEffect(() => {
    if (!open) return
    place()
    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, true)
    return () => {
      window.removeEventListener("resize", place)
      window.removeEventListener("scroll", place, true)
    }
  }, [open, align])

  function closeIfOutside(event: React.MouseEvent) {
    if (isInside(event.relatedTarget as Node)) return
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    function onPointer(event: MouseEvent) {
      if (!isInside(event.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onPointer)
    }
  }, [open])

  const panel =
    open && mounted
      ? createPortal(
          <div
            ref={panelRef}
            id={openId}
            style={{ top: box.top, left: box.left, width: box.width }}
            className="fixed z-50 overflow-hidden rounded-2xl bg-card p-3 shadow-lg ring-1 ring-foreground/10 sm:p-4"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={(event) => {
              if (isInside(event.relatedTarget as Node)) return
              setOpen(false)
            }}
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
          </div>,
          document.body,
        )
      : null

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={(event) => {
        if (isInside(event.relatedTarget as Node)) return
        setOpen(false)
      }}
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
      {panel}
    </div>
  )
}
