"use client"

import Link from "next/link"
import { getCalculator, type CalcItem } from "@/lib/catalog"
import { rememberBackSection } from "@/lib/home-back"
import type { HomeSection } from "@/lib/home-section"
import { forgetRecentCalc } from "@/lib/recent-calcs"
import { calcPath, calcSeo } from "@/lib/seo"
import { useRecentSnapshot } from "@/components/recent-result-context"

export function RecentCalcs({
  from,
  except,
  skip = 0,
  className = "",
}: {
  from?: HomeSection
  except?: string
  /** 홈에서 첫 항목은 이어서 계산 카드로 보여 주고, 칩에서는 뺍니다. */
  skip?: number
  className?: string
}) {
  const { slugs, results, refresh } = useRecentSnapshot()

  function remove(slug: string) {
    forgetRecentCalc(slug, window.localStorage)
    refresh()
  }

  const items = slugs
    .filter((slug) => slug !== except)
    .map((slug) => {
      const item = getCalculator(slug)
      return item ? { item, result: results[slug] } : null
    })
    .filter((row): row is { item: CalcItem; result: string } => row !== null)
    .slice(skip)
  if (items.length === 0) return null

  return (
    <section aria-label="최근 본 계산기" className={className}>
      <h2 className="text-sm font-medium text-muted-foreground">최근 본 계산기</h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((row) =>
          row ? (
            <li
              key={row.item.slug}
              className="inline-flex max-w-full items-center rounded-full bg-card py-1 pl-3.5 pr-1 ring-1 ring-foreground/8 hover:bg-accent"
            >
              <Link
                href={calcPath(row.item.slug)}
                className="flex min-h-11 min-w-0 max-w-[16rem] flex-col justify-center"
                onClick={() => {
                  if (from) rememberBackSection(from)
                }}
              >
                <span className="truncate text-sm">{calcSeo(row.item.slug).query}</span>
                {row.result ? (
                  <span className="truncate text-xs font-medium tabular text-foreground">
                    <span className="sr-only">마지막 결과 </span>
                    {row.result}
                  </span>
                ) : null}
              </Link>
              <button
                type="button"
                className="-mr-0.5 grid size-8 shrink-0 place-items-center text-muted-foreground hover:text-foreground"
                aria-label={`${calcSeo(row.item.slug).query} 삭제`}
                onClick={() => remove(row.item.slug)}
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
