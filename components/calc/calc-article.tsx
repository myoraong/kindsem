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
      {related.length > 0 ? (
        <div className={copy || extra ? "mt-5 border-t border-border/70 pt-4" : undefined}>
          <p className="text-xs font-semibold tracking-wide text-foreground/80">읽어 두기</p>
          <ul className="mt-2 grid gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={readingPath(item.slug)}
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}
