"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { NavMenu } from "@/components/nav-menu"
import { allRealtyItems, isRealtySlug } from "@/lib/realty"

export function RealtyMenu() {
  const pathname = usePathname()
  const [hash, setHash] = useState("")
  const parts = pathname.split("/").filter(Boolean)
  const onRealty =
    parts[0] === "realty" ||
    (parts[0] === "calc" && isRealtySlug(parts[1] ?? "")) ||
    ((pathname === "/" || pathname === "") && hash === "#realty")

  useEffect(() => {
    function syncHash() {
      setHash(window.location.hash)
    }
    syncHash()
    window.addEventListener("hashchange", syncHash)
    return () => window.removeEventListener("hashchange", syncHash)
  }, [pathname])

  return (
    <NavMenu
      href="/#realty"
      label="부동산"
      active={onRealty}
      items={allRealtyItems()}
      align="right"
      onNavigate={() => setHash("#realty")}
    />
  )
}
