import { JsonLd } from "@/components/json-ld"
import { faqJsonLd } from "@/lib/seo"

export type FaqItem = { q: string; a: string }

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">자주 묻는 질문</h2>
      <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
        {items.map((item, index) => (
          <details key={item.q} className="group" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-left text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="shrink-0 text-muted-foreground">
                <span className="group-open:hidden">+</span>
                <span className="hidden group-open:inline">−</span>
              </span>
            </summary>
            <p className="px-5 pb-4 text-sm leading-6 text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqJsonLd(items)} />
    </section>
  )
}
