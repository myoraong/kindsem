"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CalcArticle } from "@/components/calc/calc-article"
import { RelatedCalcs } from "@/components/calc/related-calcs"
import type { CalcItem } from "@/lib/catalog"
import { calcSeo } from "@/lib/seo"
import { rememberRecentCalc } from "@/lib/recent-calcs"
import { backLinkFor, homeSectionForGroup, readBackSection } from "@/lib/home-back"
import { categoryForSlug } from "@/lib/realty"
import { isTodaySlug } from "@/lib/today"
import { isWorkSlug } from "@/lib/work"
import { AffiliatePreview } from "@/components/calc/affiliate-preview"
import { AdSenseInPage } from "@/components/adsense-inpage"
import { PolicyStamp } from "@/components/policy-stamp"
import { SenaFigure } from "@/components/sena"

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
    <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-28 md:pt-10 lg:pb-10">
      <Link
        href={backHref}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
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
          <p className="mt-2 max-w-xl text-pretty break-keep text-sm leading-6 text-muted-foreground">
            {item.blurb}
          </p>
        </div>
        <SenaFigure variant="calc" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/8 md:p-6">
          {children}
        </section>
        {result}
      </div>
      <CalcArticle slug={item.slug} extra={guide} />
      <AffiliatePreview slug={item.slug} />
      {/* 결과 카드 바로 아래. 입력칸·복사·키패드를 가리지 않고, FAQ·관련 계산기보다 위에 둡니다. */}
      <AdSenseInPage />
      <RelatedCalcs slug={item.slug} />
      {faq}
      <PolicyStamp />
    </div>
  )
}
