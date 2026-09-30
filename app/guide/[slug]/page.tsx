import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { JsonLd } from "@/components/json-ld"
import { getCalculator } from "@/lib/catalog"
import {
  READINGS,
  readingBySlug,
  readingJsonLd,
  readingMetadata,
  readingPath,
} from "@/lib/reading"
import { calcPath, calcSeo } from "@/lib/seo"

export const dynamicParams = false

export function generateStaticParams() {
  return READINGS.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = readingBySlug(slug)
  if (!item) return {}
  return readingMetadata(item)
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = readingBySlug(slug)
  if (!item) notFound()

  const calcs = item.calcs.flatMap((calcSlug) => {
    const calc = getCalculator(calcSlug)
    if (!calc) return []
    return [{ slug: calcSlug, query: calcSeo(calcSlug).query }]
  })
  const others = READINGS.filter((article) => article.slug !== item.slug)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <JsonLd data={readingJsonLd(item)} />
      <p className="text-sm font-medium text-primary">
        <Link href="/guide/" className="underline-offset-2 hover:underline">
          읽어 두기
        </Link>
      </p>
      <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl">
        {item.title}
      </h1>
      <p className="mt-3 text-pretty break-keep text-sm leading-7 text-muted-foreground">
        {item.description}
      </p>
      <div className="mt-6 space-y-5 text-pretty break-keep text-sm leading-7 text-muted-foreground">
        {item.sections.map((section) => (
          <section key={section.heading} className="space-y-5">
            <h2 className="pt-2 text-base font-semibold text-foreground">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </section>
        ))}
        {calcs.length > 0 ? (
          <section className="space-y-3">
            <h2 className="pt-2 text-base font-semibold text-foreground">이어서 계산하기</h2>
            <ul className="grid gap-2">
              {calcs.map((calc) => (
                <li key={calc.slug}>
                  <Link
                    href={calcPath(calc.slug)}
                    className="font-medium text-foreground underline underline-offset-2"
                  >
                    {calc.query}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <p>
          다른 글은{" "}
          <Link href="/guide/" className="text-foreground underline underline-offset-2">
            읽어 두기
          </Link>
          에 모여 있습니다. 세율 출처는{" "}
          <Link href="/how/" className="text-foreground underline underline-offset-2">
            숫자를 어떻게 받는지
          </Link>
          를 보세요.
        </p>
        <ul className="grid gap-2">
          {others.map((article) => (
            <li key={article.slug}>
              <Link
                href={readingPath(article.slug)}
                className="text-foreground underline underline-offset-2"
              >
                {article.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
