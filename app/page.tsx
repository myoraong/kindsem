import type { ComponentType } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Banknote,
  Building2,
  Calculator,
  Home,
  Landmark,
  Percent,
  Receipt,
  Split,
  TrendingUp,
  Truck,
} from "lucide-react"
import { Sena } from "@/components/sena"
import { CALCULATORS, GROUPS, type CalcItem } from "@/lib/catalog"

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  quick: Calculator,
  dutch: Split,
  "sale-vat": Percent,
  brokerage: Receipt,
  moving: Truck,
  jeonse: Landmark,
  acquisition: Home,
  "closing-cost": Building2,
  mortgage: Banknote,
  yield: TrendingUp,
}

function CalcCard({ item }: { item: CalcItem }) {
  const Icon = ICONS[item.slug] ?? Calculator
  return (
    <Link
      href={`/calc/${item.slug}`}
      className="group flex flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/8 transition-colors hover:bg-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
          <Icon className="size-5" />
        </span>
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.blurb}</p>
    </Link>
  )
}

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <section className="flex items-center gap-4 sm:gap-6 md:gap-8">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary">살 때 · 빌릴 때 · 오늘</p>
          <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl md:text-4xl">
            어려운 숫자는 친절하게,
            <br />
            오늘 필요한 결과만.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:text-[15px]">
            차가운 계산기 대신, 살 때·빌릴 때·오늘 쓰는 계산을 따뜻하게 풀어 줍니다. 입력하는 즉시
            결과가 나오고, 부동산 금액은 보기 편한 만 원 단위입니다.
          </p>
          <p className="mt-4 text-sm text-primary">칸만 채우면 됩니다.</p>
        </div>
        <figure className="w-[4.5rem] shrink-0 sm:w-[5.25rem] md:w-24 lg:w-[6.5rem]">
          <Sena className="sena-bob" priority />
        </figure>
      </section>

      <div className="mt-10 space-y-10">
        {GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-24">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{group.title}</h2>
              <p className="text-sm text-muted-foreground">{group.subtitle}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CALCULATORS.filter((item) => item.group === group.id).map((item) => (
                <CalcCard key={item.slug} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
