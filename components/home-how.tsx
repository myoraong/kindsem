import Link from "next/link"

export function HomeHow() {
  return (
    <section className="mt-10 max-w-3xl" aria-labelledby="home-how-heading">
      <h2 id="home-how-heading" className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
        이 사이트가 세는 방식
      </h2>
      <div className="mt-4 space-y-4 text-pretty break-keep text-sm leading-7 text-muted-foreground">
        <p>
          카인드셈은 생활·급여·부동산에서 반복해서 묻는 숫자를, 회원가입 없이 이 기기에서 계산합니다.
          실수령액, 주휴수당, 퇴직금, 취득세, 중개수수료, 자동차세, 양도세, DSR처럼 검색으로 들어오는
          계산을 한곳에 모아 두었습니다.
        </p>
        <p>
          세율·상한·공제 한도는 법제처 국가법령정보와 금융위 감독규정 현행본을 읽어 넣습니다. 한국 시간
          매일 0시와 12시에 다시 받아, 어제 고시를 그대로 두지 않습니다. 표에 개인 사정이 들어가야 하는
          항목은 결과에 넣지 않습니다. 수도권 주담대 절대한도, 스트레스 DSR 가산, 신용카드·보험료 공제가
          그 예입니다.
        </p>
        <p>
          혜택은 기본으로 켜 두지 않습니다. 생애최초 취득세, 식대 비과세, 1주택 비과세, 청년 감면은
          해당할 때만 직접 고릅니다. 켜 두면 실수령·세금이 실제보다 좋아 보이기 쉽습니다.
        </p>
        <p>
          결과는 참고용입니다. 회사 원천징수, 은행 심사, 세무 신고를 대신하지 않습니다. 계산 칸에 넣은
          숫자는 서버에 저장하지 않습니다.
        </p>
        <p>
          <Link href="/how/" className="font-medium text-foreground underline underline-offset-2">
            숫자를 어떻게 받는지
          </Link>
          에 법령 출처와 빼 둔 항목을 더 적어 두었습니다.
        </p>
      </div>
    </section>
  )
}
