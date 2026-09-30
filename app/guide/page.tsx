import Link from "next/link"
import { JsonLd } from "@/components/json-ld"
import { GUIDE_METADATA, guideIndexJsonLd, READINGS, readingPath } from "@/lib/reading"

export const metadata = GUIDE_METADATA

export default function GuideIndexPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <JsonLd data={guideIndexJsonLd()} />
      <p className="text-sm font-medium text-primary">카인드셈</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl">읽어 두기</h1>
      <div className="mt-6 space-y-5 text-pretty break-keep text-sm leading-7 text-muted-foreground">
        <p>
          계산기만 나열하면, 연봉을 열두 달로 나눈 값이 실수령처럼 보이거나 중개보수 상한이 고정
          요율처럼 보입니다. 아래 글은 그 순서를 문장으로 풀어 둔 것입니다. 세율은 각 계산기가
          읽는 현행 법령·고시를 따르고, 이 글은 그 화면에 이미 있는 사실만 설명합니다.
        </p>
        <ul className="grid gap-4">
          {READINGS.map((item) => (
            <li key={item.slug}>
              <Link
                href={readingPath(item.slug)}
                className="font-medium text-foreground underline underline-offset-2"
              >
                {item.title}
              </Link>
              <p className="mt-1">{item.description}</p>
            </li>
          ))}
        </ul>
        <p>
          숫자를 넣는 화면은{" "}
          <Link href="/calc/" className="text-foreground underline underline-offset-2">
            계산기 목록
          </Link>
          에 있습니다. 세율을 어디서 읽는지는{" "}
          <Link href="/how/" className="text-foreground underline underline-offset-2">
            숫자를 어떻게 받는지
          </Link>
          에 적어 두었습니다.
        </p>
      </div>
    </div>
  )
}
