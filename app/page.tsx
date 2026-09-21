import { AdSenseInPage } from "@/components/adsense-inpage"
import { FaqList } from "@/components/calc/faq-list"
import { HomeBrowse } from "@/components/home-browse"
import { HomeHow } from "@/components/home-how"
import { HomeUses } from "@/components/home-uses"
import { HomeWhy } from "@/components/home-why"
import { JsonLd } from "@/components/json-ld"
import { SenaFigure } from "@/components/sena"
import { HOME_METADATA, homeJsonLd } from "@/lib/seo"

const HOME_FAQ = [
  {
    q: "카인드셈은 무료인가요?",
    a: "네, 모든 계산기는 회원가입 없이 무료로 쓸 수 있습니다.",
  },
  {
    q: "세율은 어디서 가져오나요?",
    a: "세법과 세율 등 지금 현행법인 법령·고시를 읽고, 바뀌면 계산에 반영됩니다.",
  },
  {
    q: "실수령액 계산 결과가 회사 명세서와 다릅니다.",
    a: "기본은 연말정산 월평균입니다. 본인 기본공제에 넣은 부양가족 인원×150만 원을 더하고, 1년 세를 12로 나눕니다. 이번 달 명세서를 고르면 간이세액표를 봅니다. 신용카드·보험료는 어느 쪽이든 넣지 않습니다.",
  },
  {
    q: "취득세에 생애최초 감면이 적용되나요?",
    a: "기본은 꺼 둡니다. 해당하면 생애최초 감면을 켜세요. 1주택·12억 이하일 때 200만 원 한도, 인구감소지역 주택은 300만 원 한도입니다.",
  },
  {
    q: "빠진 공제가 있다는데, 어떤 건가요?",
    a: "부양가족 추가 공제, 미성년 증여 2천만 원 추가, 수도권 절대한도, 스트레스 DSR 등은 법령·고시 표에 개인별 변수가 들어가서 넣지 않았습니다.",
  },
]

export const metadata = HOME_METADATA

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <JsonLd data={homeJsonLd()} />
      <section className="flex items-center gap-3 pr-1 sm:gap-4 sm:pr-6 md:gap-5 md:pr-10 lg:pr-14">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary">생활 · 급여 · 부동산</p>
          <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl md:text-4xl">
            카인드셈 종합계산기
          </h1>
          <p className="mt-3 max-w-xl text-pretty break-keep text-sm leading-6 text-muted-foreground">
            명세서·계약서·고지서에 나오는 숫자를, 한국 법령 표에 있는 세율과 상한만으로 가늠합니다.
            표에 없는 공제는 넣지 않고, 혜택 칸은 해당할 때만 직접 켭니다. 운영자와 법령 출처는 소개와
            숫자를 어떻게 받는지에 적어 두었습니다.
          </p>
        </div>
        <SenaFigure priority />
      </section>

      <HomeBrowse />
      <HomeWhy />
      <HomeUses />
      <HomeHow />
      <FaqList items={HOME_FAQ} />
      <AdSenseInPage />
    </div>
  )
}
