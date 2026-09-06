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
  const fee = <CalcLink slug="brokerage">중개보수</CalcLink>
  const move = <CalcLink slug="moving">이사 총액</CalcLink>
  const hold = <CalcLink slug="holding-tax">보유세</CalcLink>
  const gains = <CalcLink slug="capital-gains">양도세</CalcLink>

  if (here === "acquisition") {
    return (
      <Hint>
        살 때 취득세만은 여기입니다. 복비·인지세 합은 {total}, 보유세는 {hold}, 양도세는 {gains}입니다.
      </Hint>
    )
  }

  return (
    <Hint>
      잔금 전 준비 현금은 여기입니다. 취득세만은 {tax}, 복비만은 {fee}, 이사 총액은 {move}입니다.
    </Hint>
  )
}

/** 복비 상한, 이사 당일 현금, 살 때 총비용을 가릅니다. */
export function MoveSiblingHint({ here }: { here: "brokerage" | "moving" }) {
  const fee = <CalcLink slug="brokerage">중개보수</CalcLink>
  const move = <CalcLink slug="moving">이사 총액</CalcLink>
  const buy = <CalcLink slug="closing-cost">살 때 총비용</CalcLink>

  if (here === "brokerage") {
    return (
      <Hint>
        복비 상한만 보려면 여기입니다. 이사 때 나가는 돈은 {move}, 살 때 취득세·복비 합은 {buy}입니다.
      </Hint>
    )
  }

  return (
    <Hint>
      이사 때 나가는 돈은 여기입니다. 복비 상한만은 {fee}, 살 때 총비용은 {buy}입니다.
    </Hint>
  )
}

/** 받을 퇴직금과 그 금액에 붙는 세금을 가릅니다. */
export function SeveranceSiblingHint({ here }: { here: "severance" | "retirement-tax" }) {
  const pay = <CalcLink slug="severance">퇴직금</CalcLink>
  const tax = <CalcLink slug="retirement-tax">퇴직소득세</CalcLink>

  if (here === "severance") {
    return (
      <Hint>
        받을 퇴직금은 여기입니다. 그 금액에 붙는 세금은 {tax}입니다.
      </Hint>
    )
  }

  return (
    <Hint>
      퇴직금에 붙는 세금은 여기입니다. 받을 금액은 {pay}입니다.
    </Hint>
  )
}

/** 육아휴직 급여와 출산전후휴가 급여를 가릅니다. */
export function LeaveSiblingHint({ here }: { here: "parental-leave" | "maternity-leave" }) {
  const parental = <CalcLink slug="parental-leave">육아휴직</CalcLink>
  const maternity = <CalcLink slug="maternity-leave">출산전후휴가</CalcLink>

  if (here === "parental-leave") {
    return (
      <Hint>
        육아휴직 급여는 여기입니다. 출산전후휴가는 {maternity}입니다.
      </Hint>
    )
  }

  return (
    <Hint>
      출산전후휴가 급여는 여기입니다. 육아휴직은 {parental}입니다.
    </Hint>
  )
}

/** 생전 증여, 상속, 빚을 떠안은 증여, 등기 세금을 가릅니다. */
export function GiftSiblingHint({
  here,
}: {
  here: "gift-tax" | "inheritance" | "encumbered-gift" | "license-tax"
}) {
  const gift = <CalcLink slug="gift-tax">증여세</CalcLink>
  const inherit = <CalcLink slug="inheritance">상속세</CalcLink>
  const debt = <CalcLink slug="encumbered-gift">부담부증여</CalcLink>
  const license = <CalcLink slug="license-tax">등록면허세</CalcLink>

  if (here === "gift-tax") {
    return (
      <Hint>
        살아 있을 때 주면 여기입니다. 상속은 {inherit}, 빚을 떠안은 증여는 {debt}, 등기 세금은{" "}
        {license}입니다.
      </Hint>
    )
  }

  if (here === "inheritance") {
    return (
      <Hint>
        돌아가신 뒤 받으면 여기입니다. 생전 증여는 {gift}, 빚을 떠안은 증여는 {debt}, 등기 세금은{" "}
        {license}입니다.
      </Hint>
    )
  }

  if (here === "encumbered-gift") {
    return (
      <Hint>
        집과 빚을 같이 주면 여기입니다. 일반 증여는 {gift}, 상속은 {inherit}입니다.
      </Hint>
    )
  }

  return (
    <Hint>
      상속·증여 등기 때 등록세는 여기입니다. 증여세는 {gift}, 상속세는 {inherit}입니다.
    </Hint>
  )
}

/** 살 때 취득세, 갖고 있을 때 보유세, 팔 때 양도세를 가릅니다. */
export function HouseTaxSiblingHint({
  here,
}: {
  here: "holding-tax" | "capital-gains" | "corporate-gains"
}) {
  const buy = <CalcLink slug="acquisition">취득세</CalcLink>
  const hold = <CalcLink slug="holding-tax">보유세</CalcLink>
  const sell = <CalcLink slug="capital-gains">양도세</CalcLink>
  const corp = <CalcLink slug="corporate-gains">법인 양도세</CalcLink>

  if (here === "holding-tax") {
    return (
      <Hint>
        갖고 있을 때 재산세·종부세는 여기입니다. 살 때 취득세는 {buy}, 팔 때 양도세는 {sell}입니다.
      </Hint>
    )
  }

  if (here === "capital-gains") {
    return (
      <Hint>
        집을 팔 때 양도세는 여기입니다. 살 때 취득세는 {buy}, 보유세는 {hold}, 법인이면 {corp}입니다.
      </Hint>
    )
  }

  return (
    <Hint>
      법인 명의로 팔면 여기입니다. 개인 양도세는 {sell}입니다.
    </Hint>
  )
}

/** 한 직장 실수령과 이직 제안 비교를 가릅니다. */
export function PaySiblingHint({ here }: { here: "take-home" | "offer-compare" }) {
  const takeHome = <CalcLink slug="take-home">실수령</CalcLink>
  const offer = <CalcLink slug="offer-compare">이직 제안</CalcLink>

  if (here === "take-home") {
    return (
      <Hint>
        지금 직장 실수령은 여기입니다. 이직 제안과 비교는 {offer}입니다.
      </Hint>
    )
  }

  return (
    <Hint>
      이직 제안과 지금을 비교하려면 여기입니다. 한 직장 실수령만은 {takeHome}입니다.
    </Hint>
  )
}
