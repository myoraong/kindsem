import type { Metadata } from "next"
import Link from "next/link"
import { CONTACT_EMAIL } from "@/lib/site"

export const metadata: Metadata = {
  title: "개인정보 안내",
  description: "Kindsem은 회원가입 없이 계산하며, 개인정보를 수집하지 않습니다.",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <p className="text-sm font-medium text-primary">Kindsem</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl">개인정보 안내</h1>
      <div className="mt-6 max-w-xl space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          Kindsem은 회원가입과 로그인이 없고, 이름·연락처·주민번호 같은 개인정보를 받지
          않습니다. 계산에 넣은 숫자는 이 기기에서만 쓰이고 서버에 저장하지 않습니다.
        </p>
        <p>
          화면 색감만 이 브라우저에 기억합니다. 세율 안내를 맞추려고 법제처 현행 법령을 이
          브라우저에서 조회할 수 있습니다.
        </p>
        <p>
          문의는{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-foreground underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          로 보내 주세요.
        </p>
      </div>
      <Link href="/" className="mt-8 inline-block text-sm font-medium text-primary hover:underline">
        계산 모음으로
      </Link>
    </div>
  )
}
