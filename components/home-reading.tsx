import Link from "next/link"
import { GUIDE_PATH, READINGS, readingPath } from "@/lib/reading"

export function HomeReading() {
  return (
    <section className="mt-10 max-w-3xl" aria-labelledby="home-reading-heading">
      <h2
        id="home-reading-heading"
        className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]"
      >
        계산 전에 읽어 두기
      </h2>
      <div className="mt-4 space-y-4 text-pretty break-keep text-sm leading-7 text-muted-foreground">
        <p>
          계산기 칸에 숫자를 넣기 전에, 그 숫자가 무엇을 세는지 글로 풀어 두었습니다. 연봉을 열두
          달로 나눈 값이 통장 금액이 아닌 이유, 주휴가 빠지는 주, 취득세가 계약금과 다른 이유를 각
          글에서 순서대로 읽습니다.
        </p>
        <p>
          세율 표에 없는 비율은 적지 않았고, 혜택은 해당할 때만 켜라고 적어 두었습니다. 계산 결과는
          여전히 가늠이고, 글은 그 가늠의 순서를 설명합니다.
        </p>
      </div>
      <ul className="mt-4 grid gap-3">
        {READINGS.map((item) => (
          <li key={item.slug}>
            <Link
              href={readingPath(item.slug)}
              className="block rounded-2xl bg-card p-4 ring-1 ring-foreground/8 transition-colors hover:bg-muted/60 sm:p-5"
            >
              <span className="block text-[15px] font-semibold tracking-tight text-foreground">
                {item.title}
              </span>
              <span className="mt-1.5 block text-pretty break-keep text-[13px] leading-6 text-muted-foreground">
                {item.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm leading-7">
        <Link href={GUIDE_PATH} className="font-medium text-foreground underline underline-offset-2">
          읽어 두기 전체
        </Link>
      </p>
    </section>
  )
}
