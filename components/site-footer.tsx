import Link from "next/link"
import { CONTACT_EMAIL } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8 text-sm text-muted-foreground">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
            Kindsem 카인드셈
          </p>
          <p className="mt-1.5 text-xs tracking-wide text-muted-foreground">친절한 생활 계산</p>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground/80">
          <span>이메일</span>{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p>세금·대출 세율·상한은 현행 법령·고시입니다. 빠진 공제·사실관계가 있으면 결과가 달라집니다. 신고·대출 심사는 세무사·은행과 하세요.</p>
        <Link href="/privacy" className="w-fit underline underline-offset-2 hover:text-foreground">
          개인정보 안내
        </Link>
        <p className="border-t border-border/70 pt-4 text-xs">
          Copyright © 2026 Kindsem 카인드셈 All rights reserved.
        </p>
      </div>
    </footer>
  )
}
