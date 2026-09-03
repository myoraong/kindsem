"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { interceptHomeSectionClick } from "@/lib/home-section-snap"
import { closeNavMenu, getOpenNavMenu, openNavMenu, subscribeNavMenu } from "@/lib/nav-menu-open"
import { calcPath } from "@/lib/seo"
import { cn } from "@/lib/utils"

type Item = { slug: string; title: string; blurb: string }

const EDGE = 8
const BRIDGE_PX = 14
const CLOSE_MS = 240

function snapshotOpen(id: string) {
  return getOpenNavMenu() === id
}

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
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<number | null>(null)
  const [box, setBox] = useState({ top: 0, left: 0, width: 288 })
  const [mounted, setMounted] = useState(false)
  const open = useSyncExternalStore(subscribeNavMenu, () => snapshotOpen(menuId), () => false)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current)
    }
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
    setBox({ top: rect.bottom - BRIDGE_PX, left, width })
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

  function isInside(node: EventTarget | null) {
    if (!(node instanceof Node)) return false
    return Boolean(rootRef.current?.contains(node) || panelRef.current?.contains(node))
  }

  function cancelHide() {
    if (hideTimer.current === null) return
    window.clearTimeout(hideTimer.current)
    hideTimer.current = null
  }

  function show() {
    cancelHide()
    place()
    openNavMenu(menuId)
  }

  function hideNow() {
    cancelHide()
    closeNavMenu(menuId)
  }

  function hideSoon() {
    cancelHide()
    hideTimer.current = window.setTimeout(() => {
      hideTimer.current = null
      closeNavMenu(menuId)
    }, CLOSE_MS)
  }

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") hideNow()
    }
    function onPointer(event: MouseEvent) {
      if (!isInside(event.target)) hideNow()
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onPointer)
    }
  }, [open, menuId])

  const panel =
    open && mounted
      ? createPortal(
          <div
            ref={panelRef}
            id={menuId}
            style={{ top: box.top, left: box.left, width: box.width }}
            className="fixed z-50"
            onMouseEnter={show}
            onMouseLeave={(event) => {
              if (isInside(event.relatedTarget)) return
              hideSoon()
            }}
          >
            <div style={{ height: BRIDGE_PX }} aria-hidden="true" />
            <div className="overflow-hidden rounded-2xl bg-card p-3 shadow-lg ring-1 ring-foreground/10 sm:p-4">
              <ul className="max-h-[min(20rem,calc(100dvh-var(--site-header-h)-1.5rem))] space-y-0.5 overflow-y-auto overscroll-contain">
                {items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={calcPath(item.slug)}
                      onClick={() => {
                        onNavigate?.()
                        hideNow()
                      }}
                      className="block rounded-xl px-3 py-2 text-sm hover:bg-muted"
                    >
                      <span className="font-medium">{item.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{item.blurb}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={(event) => {
        if (isInside(event.relatedTarget)) return
        hideSoon()
      }}
    >
      <Link
        href={href}
        scroll={false}
        aria-expanded={open}
        aria-controls={menuId}
        aria-current={active ? "page" : undefined}
        className={cn(
          "inline-flex h-[var(--site-header-h)] items-center border-b-2 px-2 text-sm whitespace-nowrap transition-colors sm:px-2.5",
          active || open
            ? "border-primary font-medium text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )}
        onClick={(event) => {
          hideNow()
          onNavigate?.()
          interceptHomeSectionClick(href, event)
        }}
        onFocus={show}
        onBlur={(event) => {
          if (isInside(event.relatedTarget)) return
          hideNow()
        }}
      >
        {label}
      </Link>
      {panel}
    </div>
  )
}
