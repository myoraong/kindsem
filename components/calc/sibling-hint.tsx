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

  if (here === "mortgage") {
    return (
      <Hint>
        집 살 때 월 납입은 여기입니다. 신용·담보 일반은 {loan}, 전세 이자만은 {jeonse}입니다.
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
