"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { resolveAdsenseClientId, shouldRenderAdOnPath } from "@/lib/adsense"
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

  useEffect(() => {
    if (!show) return
    const el = insRef.current
    if (!el) return

    const fill = () => {
      if (el.getAttribute("data-adsbygoogle-status")) return
      if (compact && !window.matchMedia("(min-width: 768px)").matches) return
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch {
        // adsbygoogle가 아직 없거나 이미 채운 ins는 건너뜁니다.
      }
    }

    fill()
    if (!compact) return
    const mq = window.matchMedia("(min-width: 768px)")
    mq.addEventListener("change", fill)
    return () => mq.removeEventListener("change", fill)
  }, [show, pathname, compact])

  if (!show || !client) return null

  return (
    <aside
      aria-label="광고"
      className={cn(
        "overflow-hidden rounded-2xl bg-muted/50 p-3 ring-1 ring-dashed ring-foreground/12",
        compact
          ? "hidden min-h-[100px] w-full max-w-[300px] shrink-0 md:block"
          : "mt-6 min-h-[140px] w-full",
        className,
      )}
    >
      <p className="mb-2 text-center text-[11px] leading-none text-muted-foreground">광고</p>
      <ins
        ref={insRef}
        className={cn("adsbygoogle block w-full", compact ? "min-h-[80px]" : "min-h-[100px]")}
        style={{ display: "block", minHeight: compact ? 80 : 100 }}
        data-ad-client={client}
        data-ad-format="auto"
        data-full-width-responsive={compact ? "false" : "true"}
      />
    </aside>
  )
}
