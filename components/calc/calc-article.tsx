import type { ReactNode } from "react"
import { calcGuide } from "@/lib/calc-guides"

export function CalcArticle({
  slug,
  extra,
}: {
  slug: string
  extra?: ReactNode
}) {
  const copy = calcGuide(slug)
  if (!copy && !extra) return null

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
    </article>
  )
}
