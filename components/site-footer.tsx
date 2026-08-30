import { MASCOT } from "@/lib/brand"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-8 text-sm text-muted-foreground">
        <p>
          Kindsem(카인드셈)은 어려운 세금을 친절하게 풀어, 실생활에 필요한 금액만 보여 줍니다. 마스코트{" "}
          {MASCOT.name}가 같이 세어 줍니다.
        </p>
        <p>세금·대출은 추정치입니다. 실제 신고·계약 금액은 세무사, 은행, 공인중개사와 확인해 주세요.</p>
      </div>
    </footer>
  )
}
