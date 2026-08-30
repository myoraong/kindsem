"use client"

import { usePathname } from "next/navigation"
import { NavMenu } from "@/components/nav-menu"
import { isHomePath } from "@/lib/home-section"
import { isTodaySlug, todayItems } from "@/lib/today"
import { useHomeSection } from "@/lib/use-home-section"

export function TodayMenu() {
  const pathname = usePathname()
  const section = useHomeSection()
  const parts = pathname.split("/").filter(Boolean)
  const onToday =
    (parts[0] === "calc" && isTodaySlug(parts[1] ?? "")) || (isHomePath(pathname) && section === "today")

  return <NavMenu href="/#today" label="생활" active={onToday} items={todayItems()} align="left" />
}
