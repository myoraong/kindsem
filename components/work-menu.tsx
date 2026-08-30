"use client"

import { usePathname } from "next/navigation"
import { NavMenu } from "@/components/nav-menu"
import { isHomePath } from "@/lib/home-section"
import { isWorkSlug, workItems } from "@/lib/work"
import { useHomeSection } from "@/lib/use-home-section"

export function WorkMenu() {
  const pathname = usePathname()
  const section = useHomeSection()
  const parts = pathname.split("/").filter(Boolean)
  const onWork =
    (parts[0] === "calc" && isWorkSlug(parts[1] ?? "")) || (isHomePath(pathname) && section === "work")

  return <NavMenu href="/#work" label="급여" active={onWork} items={workItems()} align="right" />
}
