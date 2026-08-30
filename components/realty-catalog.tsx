import { Fragment } from "react"
import { CalcDirRow } from "@/components/calc-card"
import { REALTY_CATEGORIES, realtyItems } from "@/lib/realty"

export function RealtyCatalog() {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-card p-2 ring-1 ring-foreground/8">
      {REALTY_CATEGORIES.map((category) => (
        <Fragment key={category.id}>
          <h3 className="col-span-2 px-2.5 pt-2 pb-0.5 text-xs font-medium text-muted-foreground first:pt-1">
            {category.title}
          </h3>
          {realtyItems(category).map((item) => (
            <CalcDirRow key={item.slug} item={item} />
          ))}
        </Fragment>
      ))}
    </div>
  )
}
