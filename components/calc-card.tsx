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
  CreditCard,
  Gauge,
  Gift,
  GitFork,
  Heart,
  Home,
  Landmark,
  Moon,
  Percent,
  PiggyBank,
  Plane,
  Receipt,
  Repeat,
  Scale,
  Square,
  Split,
  TrendingUp,
  Truck,
  Umbrella,
  Wallet,
} from "lucide-react"
import type { CalcItem } from "@/lib/catalog"
import { rememberBackSection } from "@/lib/home-back"
import type { HomeSection } from "@/lib/home-section"
import { calcPath, calcSeo } from "@/lib/seo"

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
  "min-wage": Scale,
  "part-time-month": Clock,
  "prorate-pay": CalendarRange,
  "overtime-pay": Moon,
  "annual-leave": Umbrella,
  severance: Coins,
  "parental-leave": Baby,
  "maternity-leave": Heart,
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
  pyeong: Square,
  dsr: Gauge,
  "loan-interest": CreditCard,
  mortgage: Banknote,
  yield: TrendingUp,
}

/** 홈·부동산 목록. 폰도 두 칸, 메뉴당 이름+언제 두 줄. */
export const CATALOG_GRID =
  "grid grid-cols-2 gap-1 rounded-2xl bg-card p-2 ring-1 ring-foreground/8"

export function CalcDirRow({ item, from }: { item: CalcItem; from?: HomeSection }) {
  const Icon = ICONS[item.slug] ?? Calculator
  return (
    <Link
      href={calcPath(item.slug)}
      onClick={() => {
        if (from) rememberBackSection(from)
      }}
      className="group flex min-w-0 items-start gap-2 rounded-xl px-1.5 py-2 hover:bg-accent sm:items-center sm:gap-3 sm:px-2.5"
    >
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary sm:mt-0">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium leading-snug break-keep sm:text-sm">
          {calcSeo(item.slug).query}
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground sm:truncate sm:text-xs">
          {item.when}
        </span>
      </span>
    </Link>
  )
}
