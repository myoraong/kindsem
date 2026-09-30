import type { ReactNode } from "react"
import Link from "next/link"
import { calcGuide } from "@/lib/calc-guides"
import { readingPath, readingsForCalc } from "@/lib/reading"

export function CalcArticle({
  slug,
  extra,
}: {
  slug: string
  extra?: ReactNode
}) {
  const copy = calcGuide(slug)
  const related = readingsForCalc(slug)
  if (!copy && !extra && related.length === 0) return null

  return (
    <article className="mt-8 rounded-2xl bg-card p-5 text-sm leading-7 text-muted-foreground ring-1 ring-foreground/8 md:p-6">
      {copy ? (
        <>
          <h2 className="text-base font-semibold tracking-tight text-foreground">{copy.title}</h2>
          {copy.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="mt-3 text-pretty break-keep">
              {paragraph}
            </p>
          ))}
        </>
      ) : null}
      {extra ? <div className="mt-3">{extra}</div> : null}
      {related.map((item) => {
        const opening = item.sections[0]
        return (
          <section
            key={item.slug}
            className="mt-5 space-y-3 border-t border-border/70 pt-4"
          >
            <h3 className="text-sm font-semibold tracking-tight text-foreground">{item.title}</h3>
            <p className="text-xs font-semibold text-foreground/80">{opening.heading}</p>
            {opening.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="text-pretty break-keep">
                {paragraph}
              </p>
            ))}
            <p>
              <Link
                href={readingPath(item.slug)}
                className="font-medium text-foreground underline underline-offset-2"
              >
                글 전체
              </Link>
            </p>
          </section>
        )
      })}
    </article>
  )
}
