"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { RelatedCalcs } from "@/components/calc/related-calcs"
import type { CalcItem } from "@/lib/catalog"
import { calcSeo } from "@/lib/seo"
import { rememberRecentCalc } from "@/lib/recent-calcs"
import { backLinkFor, homeSectionForGroup, readBackSection } from "@/lib/home-back"
import { categoryForSlug } from "@/lib/realty"
import { isTodaySlug } from "@/lib/today"
import { isWorkSlug } from "@/lib/work"
import { AdSenseInPage } from "@/components/adsense-inpage"
import { PolicyStamp } from "@/components/policy-stamp"
import { SenaFigure } from "@/components/sena"
import { cn } from "@/lib/utils"

export function CalcShell({
  item,
  children,
  result,
  faq,
  guide,
}: {
  item: CalcItem
  children: ReactNode
  result: ReactNode
  faq?: ReactNode
  guide?: ReactNode
}) {
  const [tab, setTab] = useState<"calc" | "guide">("calc")
  const fallbackSection = homeSectionForGroup(item.group)
  const [back, setBack] = useState(backLinkFor(fallbackSection))

  useEffect(() => {
    rememberRecentCalc(item.slug, window.localStorage)
  }, [item.slug])

  useEffect(() => {
    setBack(backLinkFor(readBackSection(fallbackSection)))
  }, [fallbackSection, item.slug])

  const realty = categoryForSlug(item.slug)
  const work = isWorkSlug(item.slug)
  const today = isTodaySlug(item.slug)
  const backHref = back.href
  const backLabel = back.label
  const seo = calcSeo(item.slug)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 md:py-10 lg:pb-10">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>
      <div className="mb-6 flex items-center gap-3 sm:gap-5">
        <div className="min-w-0 flex-1 sm:flex-none sm:max-w-lg">
          <p className="text-sm text-primary">
            {realty
              ? `${realty.title} · ${item.when}`
              : work
                ? `급여 · ${item.when}`
                : today
                  ? `생활 · ${item.when}`
                  : item.when}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{seo.query}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{item.blurb}</p>
          {seo.also.length > 0 ? (
            <p className="mt-2 max-w-xl text-xs leading-6 text-muted-foreground">
              {seo.also.join(" · ")}
            </p>
          ) : null}
        </div>
        <SenaFigure variant="calc" />
      </div>
      {guide ? (
        <div className="mb-5 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("calc")}
            className={cn(
              "h-9 rounded-full px-4 text-sm",
              tab === "calc"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            계산기
          </button>
          <button
            type="button"
            onClick={() => setTab("guide")}
            className={cn(
              "h-9 rounded-full px-4 text-sm",
              tab === "guide"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            안내·세율
          </button>
        </div>
      ) : null}
      {tab === "guide" && guide ? (
        <section className="rounded-2xl bg-card p-5 text-sm leading-7 text-muted-foreground ring-1 ring-foreground/8 md:p-6">
          {guide}
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/8 md:p-6">
            {children}
          </section>
          {result}
        </div>
      )}
      {/* 결과 카드 바로 아래. 입력칸·복사·키패드를 가리지 않고, FAQ·관련 계산기보다 위에 둡니다. */}
      <AdSenseInPage />
      <RelatedCalcs slug={item.slug} />
      {faq}
      <PolicyStamp />
    </div>
  )
}
