"use client"

import Link from "next/link"
import { toast } from "sonner"
import { getCalculator } from "@/lib/catalog"
import { rememberBackSection } from "@/lib/home-back"
import type { HomeSection } from "@/lib/home-section"
import { calcPath, calcSeo } from "@/lib/seo"
import { useRecentSnapshot } from "@/components/recent-result-context"

export function ResumeCalc({ from }: { from?: HomeSection }) {
  const { slugs, results } = useRecentSnapshot()
  const slug = slugs.find((item) => getCalculator(item)) ?? null
  const result = slug ? (results[slug] ?? "") : ""

  if (!slug) return null
  const name = calcSeo(slug).query

  return (
    <section aria-label="이어서 계산">
      <h2 className="text-sm font-medium text-muted-foreground">이어서 계산</h2>
      <div className="mt-2 flex items-stretch gap-2">
        <Link
          href={calcPath(slug)}
          onClick={() => {
            if (from) rememberBackSection(from)
          }}
          className="flex min-h-11 min-w-0 flex-1 flex-col justify-center rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/8 hover:bg-accent"
        >
          <span className="truncate text-sm text-muted-foreground">{name}</span>
          {result ? (
            <span className="mt-0.5 truncate text-2xl font-semibold tracking-tight tabular">
              <span className="sr-only">마지막 결과 </span>
              {result}
            </span>
          ) : (
            <span className="mt-0.5 text-base font-medium">이어서 입력하기</span>
          )}
        </Link>
        {result ? (
          <button
            type="button"
            className="inline-flex h-auto shrink-0 items-center rounded-2xl bg-card px-3.5 text-sm font-medium ring-1 ring-foreground/8 hover:bg-accent"
            onClick={() => {
              void navigator.clipboard.writeText(result).then(() => {
                toast.success("복사됨")
              })
            }}
          >
            복사
          </button>
        ) : null}
      </div>
    </section>
  )
}
