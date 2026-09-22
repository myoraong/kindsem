"use client"

import Link from "next/link"
import { useRecentResult } from "@/components/recent-result-context"
import { popularCalculators } from "@/lib/popular-calcs"
import { rememberBackSection } from "@/lib/home-back"
import type { HomeSection } from "@/lib/home-section"
import { calcPath, calcSeo } from "@/lib/seo"

export function PopularCalcs({ from }: { from?: HomeSection }) {
  const items = popularCalculators()
  if (items.length === 0) return null

  return (
    <section aria-label="자주 찾는 계산기">
      <h2 className="text-sm font-medium text-muted-foreground">자주 찾는 계산기</h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.slug}>
            <ResultLink slug={item.slug} from={from} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ResultLink({ slug, from }: { slug: string; from?: HomeSection }) {
  const result = useRecentResult(slug)
  return (
    <Link
      href={calcPath(slug)}
      onClick={() => {
        if (from) rememberBackSection(from)
      }}
      className="inline-flex min-h-11 max-w-[16rem] flex-col justify-center rounded-full bg-card px-3.5 py-1 text-sm ring-1 ring-foreground/8 hover:bg-accent"
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
