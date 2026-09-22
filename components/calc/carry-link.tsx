"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCalcSlug } from "@/components/calc/calc-slug"
import { carryQuery } from "@/lib/calc-carry"
import { readCalcStorage, type CalcPersistValue } from "@/lib/calc-persist"
import { calcPath } from "@/lib/seo"

export function CarryLink({ slug, children }: { slug: string; children: string }) {
  const here = useCalcSlug()
  const router = useRouter()
  const href = calcPath(slug)

  return (
    <Link
      href={href}
      className="underline underline-offset-2 hover:text-foreground"
      onClick={(event) => {
        if (!here) return
        const stored = readCalcStorage<Record<string, CalcPersistValue>>(here)
        const query = carryQuery(here, slug, stored)
        if (!query) return
        event.preventDefault()
        router.push(`${href}${query}`)
      }}
    >
      {children}
    </Link>
  )
}
