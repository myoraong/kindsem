import Link from "next/link"
import { CONTACT_EMAIL } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8 text-sm text-muted-foreground">
        <div>
          <p className="text-[13px] font-semibold text-foreground">Kindsem 카인드셈</p>
          <p className="mt-1 text-xs">친절한 생활 계산</p>
        </div>
        <p>
          <span className="text-muted-foreground/80">이메일</span>{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-foreground underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-xs">세금·대출 세율·상한은 현행 법령·고시입니다. 빠진 공제·사실관계가 있으면 결과가 달라집니다. 신고·대출 심사는 세무사·은행과 하세요.</p>
        <nav aria-label="안내" className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/privacy" className="w-fit underline underline-offset-2 hover:text-foreground">
            개인정보 안내
          </Link>
          <Link href="/contact" className="w-fit underline underline-offset-2 hover:text-foreground">
            문의
          </Link>
        </nav>
        <p className="border-t border-border/70 pt-4 text-xs">
          Copyright © 2026 Kindsem 카인드셈 All rights reserved.
        </p>
      </div>
    </footer>
  )
}
