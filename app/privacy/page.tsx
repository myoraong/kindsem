import type { Metadata } from "next"
import Link from "next/link"
import { CONTACT_EMAIL } from "@/lib/site"

export const metadata: Metadata = {
  title: "개인정보 안내",
  description:
    "Kindsem은 회원가입 없이 계산하며, 개인정보를 수집하지 않습니다.",
  alternates: { canonical: "/privacy/" },
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <p className="text-sm font-medium text-primary">Kindsem</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl">개인정보 안내</h1>
      <div className="mt-6 max-w-xl space-y-8 text-sm leading-7 text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">수집하지 않는 정보</h2>
          <p>
            Kindsem은 회원가입과 로그인이 없고, 이름·연락처·주민번호 같은 개인정보를 받지 않습니다.
            계산에 넣은 숫자는 이 기기에서만 쓰이고 서버에 저장하지 않습니다. 화면 색감만 이
            브라우저에 기억합니다. 세율은 빌드할 때 법제처·금융위 현행본을 넣어 둡니다.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">광고와 쿠키</h2>
          <p>
            Google AdSense를 켜면 Google 및 제휴 네트워크(DoubleClick 등)가 쿠키·기기 식별값으로
            광고를 게재하고, 방문·클릭 같은 이용 정보를 수집할 수 있습니다. 그 정보는 Google 정책에
            따라 처리됩니다. Kindsem은 그 데이터를 받아 보관하지 않습니다.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <a
                href="https://policies.google.com/privacy"
                className="text-foreground underline underline-offset-2"
                rel="noopener noreferrer"
                target="_blank"
              >
                Google 개인정보처리방침
              </a>
            </li>
            <li>
              <a
                href="https://policies.google.com/technologies/ads"
                className="text-foreground underline underline-offset-2"
                rel="noopener noreferrer"
                target="_blank"
              >
                Google 광고가 사용하는 기술
              </a>
            </li>
            <li>
              <a
                href="https://adssettings.google.com"
                className="text-foreground underline underline-offset-2"
                rel="noopener noreferrer"
                target="_blank"
              >
                맞춤 광고 설정·거부
              </a>
            </li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">문의</h2>
          <p>
            운영 연락처는{" "}
            <Link href="/contact/" className="text-foreground underline underline-offset-2">
              문의
            </Link>{" "}
            페이지에 있습니다. 메일은{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-foreground underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
            입니다.
          </p>
        </section>
      </div>
      <Link href="/" className="mt-8 inline-block text-sm font-medium text-primary hover:underline">
        계산 모음으로
      </Link>
    </div>
  )
}
