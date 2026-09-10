import type { Metadata } from "next"
import Link from "next/link"
import { JsonLd } from "@/components/json-ld"
import { HOW_METADATA, howJsonLd, calcPath } from "@/lib/seo"
import { SITE_NAME } from "@/lib/site"

export const metadata: Metadata = HOW_METADATA

export default function HowPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <JsonLd data={howJsonLd()} />
      <p className="text-sm font-medium text-primary">{SITE_NAME}</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl">
        숫자를 어떻게 받는지
      </h1>
      <div className="mt-6 space-y-5 text-pretty break-keep text-sm leading-7 text-muted-foreground">
        <p>
          카인드셈은 계산기 모음입니다. 실수령액을 보기 위해 들어왔든, 복비 상한을 확인하러 왔든, 그
          화면에 필요한 세율과 상한만 현행 법령·고시에서 읽습니다. 채팅으로 법을 해석하지 않고, 표에
          있는 숫자를 계산식에 넣습니다.
        </p>

        <h2 className="pt-2 text-base font-semibold text-foreground">어디서 읽는지</h2>
        <p>
          소득세·법인세·상속증여세 세율, 증여·상속 공제, 취득세 중과, 재산세 구간, 중개보수 별표,
          최저임금 고시, 4대보험 요율, LTV·은행 DSR, 자동차세, 월세 세액공제, 육아휴직·출산전후휴가
          상한은 법제처 국가법령정보 공동활용과 금융위원회 은행업감독규정 별표에서 다시 받습니다. 한국
          시간 매일 0시와 12시에 한 번씩 읽고, 숫자가 바뀌면 계산기에 올립니다. 마지막 조회일은 각
          계산기 하단에 보입니다.
        </p>
        <p>
          법제처가 잠깐 응답하지 않으면 이전에 받아 둔 세율을 유지합니다. 표 모양이 바뀌어 읽지 못하면
          파서를 고친 뒤에야 새 숫자를 넣습니다. 임의로 세율을 올려 두지 않습니다.
        </p>

        <h2 className="pt-2 text-base font-semibold text-foreground">넣지 않는 것</h2>
        <p>
          법령 문장만으로 사람마다 달라지는 항목은 결과에 넣지 않습니다. 근로소득 연말정산의
          신용카드·보험료, 부양가족 추가 공제 세목, 미성년 증여 추가 한도의 특례, 간이세액표 원천징수,
          수도권 주택담보대출 절대한도, 스트레스 DSR 가산, 법무사 보수 시세가 그렇습니다. 빠진 줄이
          있으면 결과가 명세서·고지서와 달라집니다. 그때는 회사·은행·세무사가 가진 원장을 따릅니다.
        </p>

        <h2 className="pt-2 text-base font-semibold text-foreground">혜택을 기본으로 켜지 않는 이유</h2>
        <p>
          생애최초 취득세 감면, 1주택 양도 비과세, 식대 비과세, 청년 중소기업 취업 감면, 무주택 월세
          세액공제는 요건을 갖춘 사람만 해당합니다. 기본을 켜 두면 첫 화면 실수령과 세금이 실제보다 좋게
          나옵니다. 해당하면 그 칸을 직접 고르세요.
        </p>

        <h2 className="pt-2 text-base font-semibold text-foreground">단위와 빈 칸</h2>
        <p>
          월급·연봉·집값처럼 큰 금액은 만원 칸입니다. 고시 시급처럼 원 단위가 의미 있는 칸만 원입니다.
          해당하지 않는 대출·교통비·팁은 칸을 비워 두세요. 0을 기본으로 넣으면 없는 값이 있는 것처럼
          보입니다. 연봉과 월급, 평과 ㎡를 바꾸면 숫자도 같이 환산합니다.
        </p>

        <h2 className="pt-2 text-base font-semibold text-foreground">계산 결과가 하는 일</h2>
        <p>
          가늠입니다. 원천징수 신고, 종합소득 확정, 대출 실행, 등기 접수를 대신하지 않습니다. 넣은
          숫자는 이 브라우저에만 있고 서버로 올리지 않습니다. 광고가 붙는 페이지가 있어도 계산식과
          세율은 광고와 섞지 않습니다.
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
      </div>
    </div>
  )
}
