import { notFound } from "next/navigation"
import { AcquisitionCalc } from "@/components/calc/acquisition-calc"
import { BrokerageCalc } from "@/components/calc/brokerage-calc"
import { ClosingCost } from "@/components/calc/closing-cost"
import { DutchPay } from "@/components/calc/dutch-pay"
import { JeonseLoan } from "@/components/calc/jeonse-loan"
import { MortgageCalc } from "@/components/calc/mortgage-calc"
import { MovingCost } from "@/components/calc/moving-cost"
import { QuickCalc } from "@/components/calc/quick-calc"
import { SaleVat } from "@/components/calc/sale-vat"
import { YieldCalc } from "@/components/calc/yield-calc"
import { CALCULATORS, getCalculator } from "@/lib/catalog"
import type { Metadata } from "next"

export const dynamicParams = false

export function generateStaticParams() {
  return CALCULATORS.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = getCalculator(slug)
  if (!item) return {}
  return {
    title: item.title,
    description: item.blurb,
  }
}

export default async function CalcPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = getCalculator(slug)
  if (!item) notFound()

  switch (slug) {
    case "quick":
      return <QuickCalc item={item} />
    case "dutch":
      return <DutchPay item={item} />
    case "sale-vat":
      return <SaleVat item={item} />
    case "brokerage":
      return <BrokerageCalc item={item} />
    case "moving":
      return <MovingCost item={item} />
    case "jeonse":
      return <JeonseLoan item={item} />
    case "acquisition":
      return <AcquisitionCalc item={item} />
    case "closing-cost":
      return <ClosingCost item={item} />
    case "mortgage":
      return <MortgageCalc item={item} />
    case "yield":
      return <YieldCalc item={item} />
    default:
      notFound()
  }
}
