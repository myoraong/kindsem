"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCalcSlug } from "@/components/calc/calc-slug"
import { useRecentResult } from "@/components/recent-result-context"
import { carryQuery } from "@/lib/calc-carry"
import { readCalcStorage, type CalcPersistValue } from "@/lib/calc-persist"
import { relatedCalculators } from "@/lib/related-calcs"
import { calcPath, calcSeo } from "@/lib/seo"

export function RelatedCalcs({ slug }: { slug: string }) {
  const items = relatedCalculators(slug)
  if (items.length === 0) return null

  return (
    <nav className="mt-8" aria-label="이어서 볼 것">
      <h2 className="text-sm font-medium text-muted-foreground">이어서 볼 것</h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.slug}>
            <RelatedLink slug={item.slug} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

function RelatedLink({ slug }: { slug: string }) {
  const result = useRecentResult(slug)
  const here = useCalcSlug()
  const router = useRouter()
  const href = calcPath(slug)
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 max-w-[16rem] flex-col justify-center rounded-full bg-card px-3.5 py-1 text-sm ring-1 ring-foreground/8 hover:bg-accent"
      onClick={(event) => {
        if (!here) return
        const stored = readCalcStorage<Record<string, CalcPersistValue>>(here)
        const query = carryQuery(here, slug, stored)
        if (!query) return
        event.preventDefault()
        router.push(`${href}${query}`)
      }}
    >
      <span className="truncate">{calcSeo(slug).query}</span>
      {result ? (
        <span className="truncate text-xs font-medium tabular text-foreground">
          <span className="sr-only">마지막 결과 </span>
          {result}
        </span>
      ) : null}
    </Link>
  )
}
