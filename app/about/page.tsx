import type { Metadata } from "next"
import Link from "next/link"
import { JsonLd } from "@/components/json-ld"
import { ABOUT_METADATA, aboutJsonLd, calcPath } from "@/lib/seo"
import { CONTACT_EMAIL, CONTACT_OPERATOR, SITE_BRAND_NAME } from "@/lib/site"

export const metadata: Metadata = ABOUT_METADATA

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <JsonLd data={aboutJsonLd()} />
      <p className="text-sm font-medium text-primary">{SITE_BRAND_NAME}</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl">소개</h1>
      <div className="mt-6 space-y-5 text-pretty break-keep text-sm leading-7 text-muted-foreground">
        <p>
          카인드셈은 한국에서 쓰는 생활·급여·부동산 숫자를, 회원가입 없이 이 기기에서 계산하는
          사이트입니다. 실수령액, 주휴수당, 퇴직금, 취득세, 중개수수료, 자동차세, 양도세, DSR처럼
          검색으로 들어오는 계산을 한곳에 모아 두었습니다. 영어권 급여·세금 계산기를 번역해 두지
          않았고, 한국 법령 표에 있는 숫자만 넣습니다.
        </p>

        <h2 className="pt-2 text-base font-semibold text-foreground">누가 운영하는지</h2>
        <p>
          운영자는 {CONTACT_OPERATOR}입니다. 계산 결과가 명세서·고지서와 어긋날 때 메일을 받을 사람이
          누구인지를 밝힙니다. 연락은{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
          또는{" "}
          <Link href="/contact/" className="text-foreground underline underline-offset-2">
            문의
          </Link>
          로 받습니다.
        </p>

        <h2 className="pt-2 text-base font-semibold text-foreground">왜 만들었는지</h2>
        <p>
          검색으로 나오는 계산기 상당수가, 표에 없는 공제를 기본으로 켜 두거나 어제 세율을 그대로
          둡니다. 그러면 실수령이 실제보다 좋게 보이거나, 취득세가 낮게 나옵니다. 카인드셈은 해당할
          때만 혜택 칸을 고르게 하고, 한국 시간 매일 0시와 12시에 법제처·금융위 현행본을 다시
          읽습니다.
        </p>
        <p>
          연말정산 전체, 지역가입자 건강보험, 환율 시세, 전기요금처럼 사람마다 원장이 다른 항목은
          넣지 않습니다. 빠진 줄이 있으면 결과가 원장과 달라집니다. 그때는 회사·은행·세무사를
          따릅니다.
        </p>

        <h2 className="pt-2 text-base font-semibold text-foreground">숫자가 하는 일</h2>
        <p>
          가늠입니다. 원천징수 신고, 종합소득 확정, 대출 실행, 등기 접수를 대신하지 않습니다. 계산
          칸에 넣은 금액은 서버에 올리지 않고 이 브라우저에만 있습니다. 세율 출처와 빼 둔 항목은{" "}
          <Link href="/how/" className="text-foreground underline underline-offset-2">
            숫자를 어떻게 받는지
          </Link>
          에 모았습니다.
        </p>
        <p>
          급여는{" "}
          <Link href={calcPath("take-home")} className="text-foreground underline underline-offset-2">
            실수령액
          </Link>
          , 부동산은{" "}
          <Link href={calcPath("acquisition")} className="text-foreground underline underline-offset-2">
            취득세
          </Link>
          부터 보면 됩니다. 목록은{" "}
          <Link href="/calc/" className="text-foreground underline underline-offset-2">
            계산기 목록
          </Link>
          입니다.
        </p>

        <h2 className="pt-2 text-base font-semibold text-foreground">광고</h2>
        <p>
          페이지에 광고가 붙더라도 세율 표와 계산식은 광고와 섞지 않습니다. 개인정보 안내에 Google
          광고 쿠키 안내를 두었고, 문의·소개·법령 출처 페이지에는 광고 칸을 두지 않습니다.
        </p>
      </div>
    </div>
  )
}
