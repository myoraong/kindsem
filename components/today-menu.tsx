"use client"

import { usePathname } from "next/navigation"
import { NavMenu } from "@/components/nav-menu"
import { isTodaySlug, todayItems } from "@/lib/today"

export function TodayMenu() {
  const pathname = usePathname()
  const parts = pathname.split("/").filter(Boolean)
  const onToday = parts[0] === "calc" && isTodaySlug(parts[1] ?? "")

  return (
    <NavMenu href="/#today" label="생활" active={onToday} items={todayItems()} align="left" />
  )
}
