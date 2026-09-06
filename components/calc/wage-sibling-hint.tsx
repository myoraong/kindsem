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

/** 주휴·알바 월급·최저임금이 비슷해 보여서, 맨 위에 한 줄로 가릅니다. */
export function WageSiblingHint({
  here,
}: {
  here: "weekly-holiday" | "part-time-month" | "min-wage"
}) {
  const weekly = <CalcLink slug="weekly-holiday">주휴수당</CalcLink>
  const month = <CalcLink slug="part-time-month">알바 월급</CalcLink>
  const min = <CalcLink slug="min-wage">최저임금</CalcLink>

  if (here === "weekly-holiday") {
    return (
      <Hint>
        1주 주휴만 보려면 여기입니다. 월급으로 환산은 {month}, 최저와 비교는 {min}입니다.
      </Hint>
    )
  }

  if (here === "part-time-month") {
    return (
      <Hint>
        월급으로 환산하려면 여기입니다. 1주 주휴만은 {weekly}, 최저와 비교는 {min}입니다.
      </Hint>
    )
  }

  return (
    <Hint>
      최저와 비교하려면 여기입니다. 1주 주휴만은 {weekly}, 월급으로 환산은 {month}입니다.
    </Hint>
  )
}
