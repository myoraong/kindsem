import type { ComponentType } from "react"
import { BookOpen, Layers, ListX } from "lucide-react"
import { HOME_WHY, HOME_WHY_HEADING } from "@/lib/why"

const ICONS: Record<(typeof HOME_WHY)[number]["id"], ComponentType<{ className?: string }>> = {
  together: Layers,
  refresh: BookOpen,
  omit: ListX,
}

export function HomeWhy() {
  return (
    <section aria-label="다른 점" className="mt-8">
      <header className="mb-3 min-w-0">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
          {HOME_WHY_HEADING.title}
        </h2>
        <p className="mt-0.5 max-w-2xl text-pretty break-keep text-sm leading-6 text-muted-foreground sm:text-[15px]">
          {HOME_WHY_HEADING.blurb}
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-3">
        {HOME_WHY.map((item, index) => {
          const Icon = ICONS[item.id]
          return (
            <li key={item.id}>
              <article className="flex h-full gap-3 rounded-2xl bg-card p-4 ring-1 ring-primary/15 sm:p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-primary ring-1 ring-primary/20">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="flex items-baseline gap-2 text-[15px] font-semibold tracking-tight">
                    <span className="text-xs font-medium tracking-[0.12em] text-primary tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-pretty break-keep text-[13px] leading-6 text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
