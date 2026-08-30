"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export type FaqItem = { q: string; a: string }

export function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState(0)

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">자주 묻는 질문</h2>
      <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
        {items.map((item, index) => {
          const expanded = open === index
          return (
            <div key={item.q}>
              <button
                type="button"
                aria-expanded={expanded}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left text-sm font-medium"
                onClick={() => setOpen(expanded ? -1 : index)}
              >
                {item.q}
                <span className="text-muted-foreground">{expanded ? "−" : "+"}</span>
              </button>
              <p
                className={cn(
                  "px-5 pb-4 text-sm leading-6 text-muted-foreground",
                  expanded ? "block" : "hidden"
                )}
              >
                {item.a}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
