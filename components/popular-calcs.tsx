import Link from "next/link"
import { popularCalculators } from "@/lib/popular-calcs"
import { rememberBackSection } from "@/lib/home-back"
import type { HomeSection } from "@/lib/home-section"
import { calcPath, calcSeo } from "@/lib/seo"

export function PopularCalcs({ from }: { from?: HomeSection }) {
  const items = popularCalculators()
  if (items.length === 0) return null

  return (
    <section aria-label="자주 찾는 계산기">
      <h2 className="text-sm font-medium text-muted-foreground">자주 찾는 계산기</h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={calcPath(item.slug)}
              onClick={() => {
                if (from) rememberBackSection(from)
              }}
              className="inline-flex h-9 items-center rounded-full bg-card px-3.5 text-sm ring-1 ring-foreground/8 hover:bg-accent"
            >
              {calcSeo(item.slug).query}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
