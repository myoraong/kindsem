import { AdSenseInPage } from "@/components/adsense-inpage"
import { FaqList } from "@/components/calc/faq-list"
import { HomeBrowse } from "@/components/home-browse"
import { HomeWhy } from "@/components/home-why"
import { JsonLd } from "@/components/json-ld"
import { Sena } from "@/components/sena"
import { MASCOT } from "@/lib/brand"
import { HOME_METADATA, homeJsonLd } from "@/lib/seo"

const HOME_FAQ = [
  {
    q: "카인드셈은 무료인가요?",
    a: "네, 모든 계산기는 회원가입 없이 무료로 쓸 수 있습니다.",
  },
  {
    q: "세율은 어디서 가져오나요?",
    a: "법제처 국가법령정보 공동활용 API에서 소득세법, 지방세법, 공인중개사법 시행규칙, 은행업감독규정 등을 하루 두 번(09시·21시 KST) 자동으로 읽습니다.",
  },
  {
    q: "실수령액 계산 결과가 회사 명세서와 다릅니다.",
    a: "부양가족 수, 비과세 수당, 연말정산 반영 여부에 따라 차이가 납니다. 카인드셈은 본인 1인 기본공제만 넣으므로, 정확한 금액은 급여 담당자나 세무사와 확인하세요.",
  },
  {
    q: "취득세에 생애최초 감면이 적용되나요?",
    a: "1주택·12억 이하일 때 생애최초 감면(200만 원 한도)을 자동으로 계산합니다. 인구감소지역 주택은 300만 원 한도를 선택할 수 있습니다.",
  },
  {
    q: "빠진 공제가 있다는데, 어떤 건가요?",
    a: "부양가족 추가 공제, 미성년 증여 2천만 원 추가, 간이세액표, 수도권 절대한도, 스트레스 DSR 등은 법령·고시 표에 개인별 변수가 들어가서 넣지 않았습니다.",
  },
]

export const metadata = HOME_METADATA

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <JsonLd data={homeJsonLd()} />
      <section className="flex items-center gap-4 sm:gap-6 md:gap-8">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary">생활 · 급여 · 부동산</p>
          <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl md:text-4xl">
            카인드셈 생활·급여·부동산 계산기
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            실수령액, 주휴수당, 퇴직금, 취득세, 중개수수료, 자동차세, 양도세, DSR.
          </p>
        </div>
        <figure className="w-[5.25rem] shrink-0 sm:w-24 md:w-28 lg:w-[7.25rem]">
          <Sena className="sena-bob" priority />
          <figcaption className="mt-1.5 text-center">
            <span className="block text-[11px] font-semibold tracking-tight text-foreground">
              {MASCOT.name}
            </span>
            <span className="mt-0.5 hidden text-[10px] leading-4 text-muted-foreground sm:block">
              {MASCOT.meaning}
            </span>
          </figcaption>
        </figure>
      </section>

      <HomeBrowse />
      <HomeWhy />
      <FaqList items={HOME_FAQ} />
      <AdSenseInPage />
    </div>
  )
}
