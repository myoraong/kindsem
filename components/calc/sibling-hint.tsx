import Link from "next/link"
import { Hint } from "@/components/calc/hint"
import { calcPath } from "@/lib/seo"

function CalcLink({ slug, children }: { slug: string; children: string }) {
  return (
    <Link href={calcPath(slug)} className="underline underline-offset-2 hover:text-foreground">
      {children}
    </Link>
  )
}

/** 전월세 전환율과 전세 vs 월세가 같은 상한 월세로 보여서 맨 위에 가릅니다. */
export function RentSiblingHint({ here }: { here: "rent-convert" | "jeonse-vs-rent" }) {
  const convert = <CalcLink slug="rent-convert">전월세 전환율</CalcLink>
  const compare = <CalcLink slug="jeonse-vs-rent">전세 vs 월세</CalcLink>

  if (here === "rent-convert") {
    return (
      <Hint>
        보증금을 월세로 나누려면 여기입니다. 전세와 월세 중 고를 때는 {compare}입니다.
      </Hint>
    )
  }

  return (
    <Hint>
      전세와 월세 월 부담을 보려면 여기입니다. 보증금↔월세 전환 상한은 {convert}입니다.
    </Hint>
  )
}

/** 살 때 자동차 취득세와 6·12월 자동차세를 가릅니다. */
export function CarSiblingHint({ here }: { here: "vehicle-tax" | "car-tax" }) {
  const buy = <CalcLink slug="vehicle-tax">자동차 취득세</CalcLink>
  const hold = <CalcLink slug="car-tax">자동차세</CalcLink>

  if (here === "vehicle-tax") {
    return (
      <Hint>
        출고·이전 때 내는 취득세는 여기입니다. 6월·12월 보유세는 {hold}입니다.
      </Hint>
    )
  }

  return (
    <Hint>
      6월·12월 자동차세는 여기입니다. 살 때 내는 세금은 {buy}입니다.
    </Hint>
  )
}

/** 주담대 월 납입, 신용·담보 이자, 전세 이자만을 가릅니다. */
export function LoanSiblingHint({ here }: { here: "mortgage" | "loan-interest" | "jeonse" }) {
  const mortgage = <CalcLink slug="mortgage">주택담보대출</CalcLink>
  const loan = <CalcLink slug="loan-interest">대출 이자</CalcLink>
  const jeonse = <CalcLink slug="jeonse">전세대출 이자</CalcLink>
  const ltv = <CalcLink slug="ltv">LTV</CalcLink>
  const dsr = <CalcLink slug="dsr">DSR</CalcLink>

  if (here === "mortgage") {
    return (
      <Hint>
        이미 빌릴 금액의 월 납입은 여기입니다. 한도는 {ltv}·{dsr}, 신용·담보는 {loan}, 전세 이자만은{" "}
        {jeonse}입니다.
      </Hint>
    )
  }

  if (here === "loan-interest") {
    return (
      <Hint>
        신용·담보 월 납입은 여기입니다. 주담대는 {mortgage}, 전세 이자만은 {jeonse}입니다.
      </Hint>
    )
  }

  return (
    <Hint>
      전세자금 이자만 보려면 여기입니다. 주담대 월 납입은 {mortgage}, 신용·담보는 {loan}입니다.
    </Hint>
  )
}

/** 담보 한도, 소득 대비 원리금, 월 납입을 가릅니다. */
export function LimitSiblingHint({ here }: { here: "ltv" | "dsr" }) {
  const ltv = <CalcLink slug="ltv">LTV</CalcLink>
  const dsr = <CalcLink slug="dsr">DSR</CalcLink>
  const mortgage = <CalcLink slug="mortgage">주택담보대출</CalcLink>

  if (here === "ltv") {
    return (
      <Hint>
        집값 대비 대출 한도는 여기입니다. 연소득 대비 원리금은 {dsr}, 이미 정해진 원금의 월 납입은{" "}
        {mortgage}입니다.
      </Hint>
    )
  }

  return (
    <Hint>
      연소득 대비 원리금 한도는 여기입니다. 담보 한도는 {ltv}, 월 납입 계산은 {mortgage}입니다.
    </Hint>
  )
}

/** 취득세만 볼 때와 복비·인지세까지 볼 때를 가릅니다. */
export function BuySiblingHint({ here }: { here: "acquisition" | "closing-cost" }) {
  const tax = <CalcLink slug="acquisition">취득세</CalcLink>
  const total = <CalcLink slug="closing-cost">살 때 총비용</CalcLink>

  if (here === "acquisition") {
    return (
      <Hint>
        취득세만 보려면 여기입니다. 복비·인지세까지 합은 {total}입니다.
      </Hint>
    )
  }

  return (
    <Hint>
      잔금 전 준비 현금은 여기입니다. 취득세만은 {tax}입니다.
    </Hint>
  )
}
