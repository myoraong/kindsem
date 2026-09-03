import Link from "next/link"
import { Sena } from "@/components/sena"
import { MASCOT } from "@/lib/brand"
import { calcSeo } from "@/lib/seo"
import { calcFooterGroups } from "@/lib/site-urls"
import { CONTACT_EMAIL } from "@/lib/site"

export function SiteFooter() {
  const groups = calcFooterGroups()
  return (
    <footer className="mt-auto border-t border-border/70">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted-foreground">
        <div className="mb-6 flex items-center gap-3">
          <Sena variant="icon" className="size-11 rounded-2xl ring-1 ring-primary/25" />
          <div>
            <p className="text-[13px] font-semibold text-foreground">Kindsem 카인드셈</p>
            <p className="mt-0.5 text-xs">
              {MASCOT.name} · {MASCOT.meaning}
            </p>
          </div>
        </div>

        <nav aria-label="계산기" className="grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-xs font-semibold tracking-wide text-foreground/80 uppercase">
                {group.title}
              </p>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-1">
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/calc/${item.slug}/`}
                      className="text-xs leading-snug text-muted-foreground/80 underline-offset-2 transition-colors hover:text-foreground hover:underline"
                    >
                      {calcSeo(item.slug).query}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-8 flex flex-col gap-3 border-t border-border/70 pt-5">
          <nav aria-label="안내" className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <Link href="/calc/" className="underline-offset-2 hover:text-foreground hover:underline">
              계산기 목록
            </Link>
            <Link href="/privacy/" className="underline-offset-2 hover:text-foreground hover:underline">
              개인정보 안내
            </Link>
            <Link href="/contact/" className="underline-offset-2 hover:text-foreground hover:underline">
              문의
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </nav>
          <p className="text-[11px] leading-relaxed text-muted-foreground/60">
            세금·대출 세율·상한은 현행 법령·고시입니다. 빠진 공제·사실관계가 있으면 결과가 달라집니다. 신고·대출 심사는 세무사·은행과 하세요.
          </p>
          <p className="text-[11px] text-muted-foreground/50">
            © 2026 Kindsem 카인드셈
          </p>
        </div>
      </div>
    </footer>
  )
}
