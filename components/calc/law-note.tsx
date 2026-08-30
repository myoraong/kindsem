import { LAW_CHECKED_ON } from "@/lib/law-sources"

export function LawNote({
  lines,
}: {
  lines: { title: string; href: string; effective: string; note?: string }[]
}) {
  return (
    <div className="mt-6 space-y-2 border-t border-dashed border-border pt-4 text-xs leading-5 text-muted-foreground">
      <p>법령은 법제처에서 {LAW_CHECKED_ON} 조회한 현행 기준입니다. 실제 세액은 사실관계에 따라 달라질 수 있습니다.</p>
      <ul className="space-y-1">
        {lines.map((line) => (
          <li key={line.href}>
            <a href={line.href} className="underline underline-offset-2 hover:text-foreground" target="_blank" rel="noreferrer">
              {line.title}
            </a>
            <span> · 시행 {line.effective}</span>
            {line.note ? <span> · {line.note}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
