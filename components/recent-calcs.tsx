"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getCalculator } from "@/lib/catalog"
import { rememberBackSection } from "@/lib/home-back"
import type { HomeSection } from "@/lib/home-section"
import { forgetRecentCalc, readRecentCalcs } from "@/lib/recent-calcs"
import { calcPath, calcSeo } from "@/lib/seo"

export function RecentCalcs({ from }: { from?: HomeSection }) {
  const [slugs, setSlugs] = useState<string[]>([])

  useEffect(() => {
    setSlugs(readRecentCalcs(window.localStorage))
  }, [])

  function remove(slug: string) {
    forgetRecentCalc(slug, window.localStorage)
    setSlugs(readRecentCalcs(window.localStorage))
  }

  const items = slugs.map((slug) => getCalculator(slug)).filter((item) => Boolean(item))
  if (items.length === 0) return null

  return (
    <section aria-label="최근 본 계산기">
      <h2 className="text-sm font-medium text-muted-foreground">최근 본 계산기</h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((item) =>
          item ? (
            <li
              key={item.slug}
              className="inline-flex h-8 items-center rounded-full bg-card pl-3 pr-1 ring-1 ring-foreground/8 hover:bg-accent"
            >
              <Link
                href={calcPath(item.slug)}
                className="text-sm"
                onClick={() => {
                  if (from) rememberBackSection(from)
                }}
              >
                {calcSeo(item.slug).query}
              </Link>
              <button
                type="button"
                className="-mr-0.5 grid size-6 shrink-0 place-items-center text-muted-foreground hover:text-foreground"
                aria-label={`${calcSeo(item.slug).query} 삭제`}
                onClick={() => remove(item.slug)}
              >
                <span aria-hidden="true" className="text-[15px] leading-none">
                  ×
                </span>
              </button>
            </li>
          ) : null,
        )}
      </ul>
    </section>
  )
}
