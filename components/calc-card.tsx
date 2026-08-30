import type { ComponentType } from "react"
import Link from "next/link"
import {
  ArrowLeftRight,
  Award,
  Banknote,
  Bike,
  Building2,
  Calculator,
  CalendarDays,
  Car,
  Coins,
  Gift,
  Home,
  Landmark,
  Percent,
  Receipt,
  Repeat,
  Split,
  TrendingUp,
  Truck,
  Umbrella,
  Wallet,
} from "lucide-react"
import type { CalcItem } from "@/lib/catalog"

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  quick: Calculator,
  dutch: Split,
  "sale-vat": Percent,
  "vehicle-tax": Car,
  "take-home": Wallet,
  "weekly-holiday": CalendarDays,
  "annual-leave": Umbrella,
  severance: Coins,
  "offer-compare": ArrowLeftRight,
  "side-job-tax": Bike,
  "benefit-net": Gift,
  "cert-payback": Award,
  brokerage: Receipt,
  moving: Truck,
  jeonse: Landmark,
  "rent-convert": Repeat,
  acquisition: Home,
  "closing-cost": Building2,
  mortgage: Banknote,
  yield: TrendingUp,
}

export function CalcDirRow({ item }: { item: CalcItem }) {
  const Icon = ICONS[item.slug] ?? Calculator
  return (
    <Link
      href={`/calc/${item.slug}`}
      className="group flex min-w-0 items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-accent"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{item.title}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.when}</span>
      </span>
    </Link>
  )
}
