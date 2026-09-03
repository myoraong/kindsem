import { notFound } from "next/navigation"
import { AcquisitionCalc } from "@/components/calc/acquisition-calc"
import { AnnualLeave } from "@/components/calc/annual-leave"
import { BenefitNet } from "@/components/calc/benefit-net"
import { BrokerageCalc } from "@/components/calc/brokerage-calc"
import { CertPayback } from "@/components/calc/cert-payback"
import { ClosingCost } from "@/components/calc/closing-cost"
import { DsrCalc } from "@/components/calc/dsr-calc"
import { DutchPay } from "@/components/calc/dutch-pay"
import { LadderCalc } from "@/components/calc/ladder-calc"
import { ImportDuty } from "@/components/calc/import-duty"
import { JeonseLoan } from "@/components/calc/jeonse-loan"
import { JeonseVsRent } from "@/components/calc/jeonse-vs-rent"
import { LtvCalc } from "@/components/calc/ltv-calc"
import { MortgageCalc } from "@/components/calc/mortgage-calc"
import { MovingCost } from "@/components/calc/moving-cost"
import { OfferCompareCalc } from "@/components/calc/offer-compare-calc"
import { OvertimePay } from "@/components/calc/overtime-pay"
import { ParentalLeave } from "@/components/calc/parental-leave"
import { MaternityLeave } from "@/components/calc/maternity-leave"
import { MinWageCalc } from "@/components/calc/min-wage-calc"
import { LoanInterestCalc } from "@/components/calc/loan-interest-calc"
import { QuickCalc } from "@/components/calc/quick-calc"
import { RentConvert } from "@/components/calc/rent-convert"
import { SaleVat } from "@/components/calc/sale-vat"
import { Severance } from "@/components/calc/severance-calc"
import { RetirementTax } from "@/components/calc/retirement-tax"
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
import { VehicleTax } from "@/components/calc/vehicle-tax"
import { CarTax } from "@/components/calc/car-tax"
import { WeeklyHoliday } from "@/components/calc/weekly-holiday"
import { PartTimeMonth } from "@/components/calc/part-time-month"
import { ProratePay } from "@/components/calc/prorate-pay"
import { DepositCalc } from "@/components/calc/deposit-calc"
import { RentCredit } from "@/components/calc/rent-credit"
import { YieldCalc } from "@/components/calc/yield-calc"
import { JsonLd } from "@/components/json-ld"
import { CALCULATORS, getCalculator, type CalcItem } from "@/lib/catalog"
import { calcJsonLd, calcMetadata } from "@/lib/seo"
import type { Metadata } from "next"
import type { ReactNode } from "react"

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
  return calcMetadata(item)
}

export default async function CalcPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = getCalculator(slug)
  if (!item) notFound()

  return (
    <>
      <JsonLd data={calcJsonLd(item)} />
      {calcBody(slug, item)}
    </>
  )
}

function calcBody(slug: string, item: CalcItem): ReactNode {
  switch (slug) {
    case "quick":
      return <QuickCalc item={item} />
    case "dutch":
      return <DutchPay item={item} />
    case "ladder":
      return <LadderCalc item={item} />
    case "sale-vat":
      return <SaleVat item={item} />
    case "vehicle-tax":
      return <VehicleTax item={item} />
    case "car-tax":
      return <CarTax item={item} />
    case "import-duty":
      return <ImportDuty item={item} />
    case "deposit":
      return <DepositCalc item={item} />
    case "take-home":
      return <TakeHomeCalc item={item} />
    case "weekly-holiday":
      return <WeeklyHoliday item={item} />
    case "min-wage":
      return <MinWageCalc item={item} />
    case "part-time-month":
      return <PartTimeMonth item={item} />
    case "prorate-pay":
      return <ProratePay item={item} />
    case "overtime-pay":
      return <OvertimePay item={item} />
    case "annual-leave":
      return <AnnualLeave item={item} />
    case "severance":
      return <Severance item={item} />
    case "retirement-tax":
      return <RetirementTax item={item} />
    case "parental-leave":
      return <ParentalLeave item={item} />
    case "maternity-leave":
      return <MaternityLeave item={item} />
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
    case "rent-convert":
      return <RentConvert item={item} />
    case "jeonse-vs-rent":
      return <JeonseVsRent item={item} />
    case "rent-credit":
      return <RentCredit item={item} />
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
    case "loan-interest":
      return <LoanInterestCalc item={item} />
    case "mortgage":
      return <MortgageCalc item={item} />
    case "yield":
      return <YieldCalc item={item} />
    default:
      notFound()
  }
}
