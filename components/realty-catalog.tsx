import { CalcDirRow } from "@/components/calc-card"
import { REALTY_CATEGORIES, realtyItems } from "@/lib/realty"

export function RealtyCatalog() {
  const items = REALTY_CATEGORIES.flatMap((category) => realtyItems(category))
  return (
    <div className="grid gap-1 rounded-2xl bg-card p-2 ring-1 ring-foreground/8 sm:grid-cols-2">
      {items.map((item) => (
        <CalcDirRow key={item.slug} item={item} />
      ))}
    </div>
  )
}
