import type { Metadata } from "next"
import Link from "next/link"
import { CONTACT_EMAIL, CONTACT_OPERATOR, SITE_NAME } from "@/lib/site"

export const metadata: Metadata = {
  title: "문의",
  description: `${SITE_NAME} 운영 연락처. 생활·급여·부동산 계산기 문의는 이메일로 받습니다.`,
}

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <p className="text-sm font-medium text-primary">{SITE_NAME}</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl">문의</h1>
      <div className="mt-6 max-w-xl space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          Kindsem은 생활·급여·부동산 계산기입니다. 더치페이·실수령·취득세처럼 일상에서 쓰는 숫자를
          이 기기에서 계산합니다. 회원가입은 없습니다.
        </p>
        <p>
          운영자 {CONTACT_OPERATOR}. 메일은{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-foreground underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          입니다.
        </p>
        <p>
          사이트 오류나 표기 문제는 메일로 보내 주세요. 계산 결과만으로 세금 신고·대출 심사를 대신하지
          않습니다.
        </p>
      </div>
      <Link href="/" className="mt-8 inline-block text-sm font-medium text-primary hover:underline">
        계산 모음으로
      </Link>
    </div>
  )
}
