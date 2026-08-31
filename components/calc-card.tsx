"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import {
  ArrowLeftRight,
  Award,
  Banknote,
  Baby,
  Bike,
  Building2,
  Calculator,
  CalendarDays,
  CalendarRange,
  Car,
  Clock,
  Coins,
  Gauge,
  Gift,
  GitFork,
  Home,
  Landmark,
  Moon,
  Percent,
  PiggyBank,
  Plane,
  Receipt,
  Repeat,
  Split,
  TrendingUp,
  Truck,
  Umbrella,
  Wallet,
} from "lucide-react"
import type { CalcItem } from "@/lib/catalog"
import { rememberBackSection } from "@/lib/home-back"
import type { HomeSection } from "@/lib/home-section"
import { calcSeo } from "@/lib/seo"

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  quick: Calculator,
  dutch: Split,
  ladder: GitFork,
  "sale-vat": Percent,
  "vehicle-tax": Car,
  "car-tax": Gauge,
  deposit: PiggyBank,
  "import-duty": Plane,
  "take-home": Wallet,
  "weekly-holiday": CalendarDays,
  "part-time-month": Clock,
  "prorate-pay": CalendarRange,
  "overtime-pay": Moon,
  "annual-leave": Umbrella,
  severance: Coins,
  "parental-leave": Baby,
  "offer-compare": ArrowLeftRight,
  "side-job-tax": Bike,
  "benefit-net": Gift,
  "cert-payback": Award,
  brokerage: Receipt,
  moving: Truck,
  jeonse: Landmark,
  "rent-convert": Repeat,
  "jeonse-vs-rent": ArrowLeftRight,
  "rent-credit": Receipt,
  acquisition: Home,
  "closing-cost": Building2,
  mortgage: Banknote,
  yield: TrendingUp,
}

export function CalcDirRow({ item, from }: { item: CalcItem; from?: HomeSection }) {
  const Icon = ICONS[item.slug] ?? Calculator
  return (
    <Link
      href={`/calc/${item.slug}`}
      onClick={() => {
        if (from) rememberBackSection(from)
      }}
      className="group flex min-w-0 items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-accent"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{calcSeo(item.slug).query}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.when}</span>
      </span>
    </Link>
  )
}
