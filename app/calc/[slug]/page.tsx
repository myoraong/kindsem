import { notFound } from "next/navigation"
import { AcquisitionCalc } from "@/components/calc/acquisition-calc"
import { BenefitNet } from "@/components/calc/benefit-net"
import { BrokerageCalc } from "@/components/calc/brokerage-calc"
import { CertPayback } from "@/components/calc/cert-payback"
import { ClosingCost } from "@/components/calc/closing-cost"
import { DsrCalc } from "@/components/calc/dsr-calc"
import { DutchPay } from "@/components/calc/dutch-pay"
import { JeonseLoan } from "@/components/calc/jeonse-loan"
import { LtvCalc } from "@/components/calc/ltv-calc"
import { MortgageCalc } from "@/components/calc/mortgage-calc"
import { MovingCost } from "@/components/calc/moving-cost"
import { OfferCompareCalc } from "@/components/calc/offer-compare-calc"
import { QuickCalc } from "@/components/calc/quick-calc"
import { SaleVat } from "@/components/calc/sale-vat"
import { SideJobTax } from "@/components/calc/side-job-tax"
import { TakeHomeCalc } from "@/components/calc/take-home-calc"
import {
  CapitalGainsCalc,
  CorporateGainsCalc,
  EncumberedGiftCalc,
  GiftTaxCalc,
  HoldingTaxCalc,
  InheritanceCalc,
  LicenseTaxCalc,
} from "@/components/calc/tax-pack"
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
    case "take-home":
      return <TakeHomeCalc item={item} />
    case "offer-compare":
      return <OfferCompareCalc item={item} />
    case "side-job-tax":
      return <SideJobTax item={item} />
    case "benefit-net":
      return <BenefitNet item={item} />
    case "cert-payback":
      return <CertPayback item={item} />
    case "brokerage":
      return <BrokerageCalc item={item} />
    case "moving":
      return <MovingCost item={item} />
    case "jeonse":
      return <JeonseLoan item={item} />
    case "acquisition":
      return <AcquisitionCalc item={item} />
    case "capital-gains":
      return <CapitalGainsCalc item={item} />
    case "corporate-gains":
      return <CorporateGainsCalc item={item} />
    case "holding-tax":
      return <HoldingTaxCalc item={item} />
    case "license-tax":
      return <LicenseTaxCalc item={item} />
    case "gift-tax":
      return <GiftTaxCalc item={item} />
    case "inheritance":
      return <InheritanceCalc item={item} />
    case "encumbered-gift":
      return <EncumberedGiftCalc item={item} />
    case "closing-cost":
      return <ClosingCost item={item} />
    case "ltv":
      return <LtvCalc item={item} />
    case "dsr":
      return <DsrCalc item={item} />
    case "mortgage":
      return <MortgageCalc item={item} />
    case "yield":
      return <YieldCalc item={item} />
    default:
      notFound()
  }
}
