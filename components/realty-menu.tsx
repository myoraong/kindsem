"use client"

import { usePathname } from "next/navigation"
import { NavMenu } from "@/components/nav-menu"
import { rememberBackSection } from "@/lib/home-back"
import { isHomePath } from "@/lib/home-section"
import { allRealtyItems, isRealtySlug } from "@/lib/realty"
import { useHomeSection } from "@/lib/use-home-section"

export function RealtyMenu() {
  const pathname = usePathname()
  const section = useHomeSection()
  const parts = pathname.split("/").filter(Boolean)
  const onRealty =
    parts[0] === "realty" ||
    (parts[0] === "calc" && isRealtySlug(parts[1] ?? "")) ||
    (isHomePath(pathname) && section === "realty")

  return (
    <NavMenu
      href="/#realty"
      label="부동산"
      active={onRealty}
      items={allRealtyItems()}
      align="right"
      onNavigate={() => rememberBackSection("realty")}
    />
  )
}
