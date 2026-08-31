import type { ComponentType } from "react"
import { BookOpen, Layers, ListX } from "lucide-react"
import { HOME_WHY } from "@/lib/why"

const ICONS: Record<(typeof HOME_WHY)[number]["id"], ComponentType<{ className?: string }>> = {
  together: Layers,
  refresh: BookOpen,
  omit: ListX,
}

export function HomeWhy() {
  return (
    <section aria-label="다른 점" className="mt-6">
      <h2 className="text-sm font-medium text-primary">여기가 다른 점</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-3">
        {HOME_WHY.map((item, index) => {
          const Icon = ICONS[item.id]
          return (
            <li key={item.id}>
              <article className="flex h-full flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-primary/15 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-primary ring-1 ring-primary/20">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium tracking-[0.12em] text-primary [font-variant-numeric:tabular-nums]">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="text-base font-semibold tracking-tight">{item.title}</h3>
                  </div>
                </div>
                <p className="text-pretty break-keep text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
