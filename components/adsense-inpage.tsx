"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import {
  adFillFromStatus,
  adSlotShowsChrome,
  resolveAdsenseClientId,
  shouldRenderAdOnPath,
  type AdFill,
} from "@/lib/adsense"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

export function AdSenseInPage({
  className,
  size = "default",
}: {
  className?: string
  size?: "default" | "compact"
}) {
  const pathname = usePathname()
  const insRef = useRef<HTMLModElement>(null)
  const client = resolveAdsenseClientId()
  const show = Boolean(client) && shouldRenderAdOnPath(pathname)
  const compact = size === "compact"
  const [fill, setFill] = useState<AdFill>("pending")
  const chrome = adSlotShowsChrome(fill)

  useEffect(() => {
    if (!show) return
    const el = insRef.current
    if (!el) return

    const readFill = () => setFill(adFillFromStatus(el.getAttribute("data-ad-status")))
    readFill()
    const observer = new MutationObserver(readFill)
    observer.observe(el, { attributes: true, attributeFilter: ["data-ad-status"] })

    const fillSlot = () => {
      if (el.getAttribute("data-adsbygoogle-status")) return
      if (compact && !window.matchMedia("(min-width: 768px)").matches) return
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch {
        // adsbygoogle가 아직 없거나 이미 채운 ins는 건너뜁니다.
      }
    }

    fillSlot()
    if (!compact) {
      return () => observer.disconnect()
    }
    const mq = window.matchMedia("(min-width: 768px)")
    mq.addEventListener("change", fillSlot)
    return () => {
      observer.disconnect()
      mq.removeEventListener("change", fillSlot)
    }
  }, [show, pathname, compact])

  if (!show || !client) return null

  return (
    <aside
      aria-hidden={!chrome}
      aria-label="광고"
      className={cn(
        compact && "shrink-0 self-start",
        compact && fill === "unfilled" && "hidden",
        compact && fill !== "unfilled" && "hidden md:block",
        !compact && "w-full",
        !compact && fill === "unfilled" && "hidden",
        fill === "pending" && "pointer-events-none overflow-hidden opacity-0",
        fill === "pending" && (compact ? "h-0 w-[300px]" : "h-0"),
        chrome &&
          (compact
            ? "w-[300px] overflow-hidden rounded-2xl bg-muted/50 p-3 ring-1 ring-dashed ring-foreground/12"
            : "mt-6 overflow-hidden rounded-2xl bg-muted/50 p-3 ring-1 ring-dashed ring-foreground/12"),
        className,
      )}
    >
      {chrome ? (
        <p className="mb-2 text-center text-[11px] leading-none text-muted-foreground">광고</p>
      ) : null}
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: "block", width: compact ? 300 : "100%", minHeight: compact ? 80 : 100 }}
        data-ad-client={client}
        data-ad-format="auto"
        data-full-width-responsive={compact ? "false" : "true"}
      />
    </aside>
  )
}
