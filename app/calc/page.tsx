import Link from "next/link"
import { JsonLd } from "@/components/json-ld"
import { CALCULATORS, CATALOG_HEADINGS } from "@/lib/catalog"
import { CALC_INDEX_METADATA, calcSeo, homeJsonLd } from "@/lib/seo"

export const metadata = CALC_INDEX_METADATA

const SECTIONS = [
  {
    id: "today",
    ...CATALOG_HEADINGS.today,
    items: CALCULATORS.filter((item) => item.group === "today"),
  },
  {
    id: "work",
    ...CATALOG_HEADINGS.work,
    items: CALCULATORS.filter((item) => item.group === "work"),
  },
  {
    id: "realty",
    ...CATALOG_HEADINGS.realty,
    items: CALCULATORS.filter((item) => item.group !== "today" && item.group !== "work"),
  },
] as const

export default function CalcIndexPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <JsonLd data={homeJsonLd()} />
      <p className="text-sm font-medium text-primary">Kindsem 카인드셈</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl">계산기 목록</h1>
      <div className="mt-3 max-w-2xl space-y-3 text-pretty break-keep text-sm leading-7 text-muted-foreground">
        <p>
          생활·급여·부동산에서 쓰는 계산기입니다. 검색에 나오는 이름(실수령액, 주휴수당, 취득세,
          중개수수료)으로 모아 두었습니다. 회원가입은 없고 이 기기에서만 셉니다.
        </p>
        <p>
          세율은 법제처·금융위 현행본입니다. 표에 없는 공제는 빼 둡니다. 각 계산기 아래에는 그 화면이
          세는 것과 세지 않는 것을 글로 적어 두었습니다.{" "}
          <Link href="/how/" className="text-foreground underline underline-offset-2">
            숫자를 어떻게 받는지
          </Link>
          에서 출처와 빼 둔 항목을 모았습니다.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{section.blurb}</p>
            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
              {section.items.map((item) => {
                const seo = calcSeo(item.slug)
                return (
                  <li key={item.slug}>
                    <Link
                      href={`/calc/${item.slug}/`}
                      className="block px-4 py-3.5 hover:bg-accent sm:px-5"
                    >
                      <span className="block text-sm font-medium text-foreground">{seo.query}</span>
                      <span className="mt-0.5 block text-xs leading-6 text-pretty break-keep text-muted-foreground">
                        {item.blurb}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
