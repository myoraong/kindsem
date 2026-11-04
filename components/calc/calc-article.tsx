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
    <article className="mt-8 overflow-hidden rounded-2xl bg-card text-sm leading-7 text-muted-foreground ring-1 ring-foreground/8">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-left marker:content-none md:px-6 [&::-webkit-details-marker]:hidden">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {copy?.title ?? "안내"}
          </h2>
          <span className="shrink-0 text-muted-foreground">
            <span className="group-open:hidden">+</span>
            <span className="hidden group-open:inline">−</span>
          </span>
        </summary>
        <div className="px-5 pb-5 md:px-6 md:pb-6">
          {copy
            ? copy.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="mt-3 text-pretty break-keep">
                  {paragraph}
                </p>
              ))
            : null}
          {extra ? <div className="mt-3">{extra}</div> : null}
        </div>
      </details>
    </article>
  )
}
