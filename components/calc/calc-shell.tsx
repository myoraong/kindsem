"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CalcArticle } from "@/components/calc/calc-article"
import { RelatedCalcs } from "@/components/calc/related-calcs"
import { RecentCalcs } from "@/components/recent-calcs"
import type { CalcItem } from "@/lib/catalog"
import { calcSeo } from "@/lib/seo"
import { CalcSlugProvider } from "@/components/calc/calc-slug"
import { rememberRecentCalc } from "@/lib/recent-calcs"
import { requestCalcReset } from "@/lib/use-calc-persist"
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
    <CalcSlugProvider slug={item.slug}>
    <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-36 md:pt-10 lg:pb-10">
      <Link
        href={backHref}
        className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
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
          <div className="mb-4 flex items-center justify-between gap-3">
            <a
              href="#calc-result"
              className="inline-flex h-11 items-center text-sm font-medium text-primary"
              onClick={(event) => {
                const target = document.getElementById("calc-result")
                if (!target) return
                event.preventDefault()
                target.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
            >
              결과 보기
            </a>
            {item.slug !== "quick" && item.slug !== "ladder" ? (
              <button
                type="button"
                className="inline-flex h-11 items-center px-1 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
                onClick={(event) => {
                  requestCalcReset(item.slug)
                  const section = event.currentTarget.closest("section")
                  window.setTimeout(() => {
                    const field = section?.querySelector(
                      "input:not([type=checkbox]):not([type=radio])",
                    )
                    if (field instanceof HTMLInputElement) field.focus()
                  }, 30)
                }}
              >
                처음 값
              </button>
            ) : (
              <span />
            )}
          </div>
          {children}
        </section>
        {result}
      </div>
      <RecentCalcs except={item.slug} className="mt-8" />
      <RelatedCalcs slug={item.slug} />
      <CalcArticle slug={item.slug} extra={guide} />
      <AffiliatePreview slug={item.slug} />
      {faq}
      {/* 안내·FAQ 뒤에 둡니다. 입력칸을 가리지 않고, 본문보다 광고가 먼저 보이지 않게 합니다. */}
      <AdSenseInPage />
      <PolicyStamp />
    </div>
    </CalcSlugProvider>
  )
}
