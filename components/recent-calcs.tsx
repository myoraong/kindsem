"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getCalculator } from "@/lib/catalog"
import { readRecentCalcs } from "@/lib/recent-calcs"

export function RecentCalcs() {
  const [slugs, setSlugs] = useState<string[]>([])

  useEffect(() => {
    setSlugs(readRecentCalcs(window.localStorage))
  }, [])

  const items = slugs.map((slug) => getCalculator(slug)).filter((item) => Boolean(item))
  if (items.length === 0) return null

  return (
    <section className="mt-6" aria-label="최근 본 계산기">
      <h2 className="text-sm font-medium text-muted-foreground">최근 본 계산기</h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((item) =>
          item ? (
            <li key={item.slug}>
              <Link
                href={`/calc/${item.slug}`}
                className="inline-flex h-9 items-center rounded-full bg-card px-3.5 text-sm ring-1 ring-foreground/8 hover:bg-accent"
              >
                {item.title}
              </Link>
            </li>
          ) : null,
        )}
      </ul>
    </section>
  )
}
