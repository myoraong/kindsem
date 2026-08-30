"use client"

import { usePathname } from "next/navigation"
import { NavMenu } from "@/components/nav-menu"
import { isWorkSlug, workItems } from "@/lib/work"

export function WorkMenu() {
  const pathname = usePathname()
  const parts = pathname.split("/").filter(Boolean)
  const onWork = parts[0] === "calc" && isWorkSlug(parts[1] ?? "")

  return (
    <NavMenu href="/#work" label="급여" active={onWork} items={workItems()} align="right" />
  )
}
