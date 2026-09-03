import { Fragment } from "react"
import { CalcDirRow, CATALOG_GRID } from "@/components/calc-card"
import type { HomeSection } from "@/lib/home-section"
import { REALTY_CATEGORIES, realtyItems } from "@/lib/realty"

export function RealtyCatalog({ from }: { from?: HomeSection }) {
  return (
    <div className={CATALOG_GRID}>
      {REALTY_CATEGORIES.map((category) => (
        <Fragment key={category.id}>
          <h3 className="col-span-full px-2.5 pt-2 pb-0.5 text-xs font-medium text-muted-foreground first:pt-1">
            {category.title}
          </h3>
          {realtyItems(category).map((item) => (
            <CalcDirRow key={item.slug} item={item} from={from} />
          ))}
        </Fragment>
      ))}
    </div>
  )
}
