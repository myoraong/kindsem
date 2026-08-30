import Link from "next/link"
import { relatedCalculators } from "@/lib/related-calcs"

export function RelatedCalcs({ slug }: { slug: string }) {
  const items = relatedCalculators(slug)
  if (items.length === 0) return null

  return (
    <nav className="mt-8" aria-label="이어서 볼 것">
      <h2 className="text-sm font-medium text-muted-foreground">이어서 볼 것</h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/calc/${item.slug}`}
              className="inline-flex h-9 items-center rounded-full bg-card px-3.5 text-sm ring-1 ring-foreground/8 hover:bg-accent"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
