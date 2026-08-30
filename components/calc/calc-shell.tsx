import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Sena } from "@/components/sena"
import type { CalcItem } from "@/lib/catalog"

export function CalcShell({
  item,
  children,
  result,
}: {
  item: CalcItem
  children: React.ReactNode
  result: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:py-10">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        계산 모음
      </Link>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-primary">{item.when}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{item.title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{item.blurb}</p>
        </div>
        <Sena className="hidden w-12 shrink-0 sm:block md:w-14" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/8 md:p-6">
          {children}
        </section>
        {result}
      </div>
    </div>
  )
}
