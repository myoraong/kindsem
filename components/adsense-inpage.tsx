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

export function AdSenseInPage({ className }: { className?: string }) {
  const pathname = usePathname()
  const insRef = useRef<HTMLModElement>(null)
  const client = resolveAdsenseClientId()
  const show = Boolean(client) && shouldRenderAdOnPath(pathname)

  useEffect(() => {
    if (!show) return
    const el = insRef.current
    if (!el || el.getAttribute("data-adsbygoogle-status")) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // adsbygoogle가 아직 없거나 이미 채운 ins는 건너뜁니다.
    }
  }, [show, pathname])

  if (!show || !client) return null

  return (
    <aside
      aria-label="광고"
      className={cn(
        "mt-6 min-h-[140px] overflow-hidden rounded-2xl bg-muted/50 p-3 ring-1 ring-dashed ring-foreground/12",
        className,
      )}
    >
      <p className="mb-2 text-center text-[11px] leading-none text-muted-foreground">광고</p>
      <ins
        ref={insRef}
        className="adsbygoogle block min-h-[100px] w-full"
        style={{ display: "block", minHeight: 100 }}
        data-ad-client={client}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}
