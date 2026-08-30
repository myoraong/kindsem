export function LawNote({
  lines,
}: {
  lines: { title: string; href: string; effective: string; note?: string }[]
}) {
  return (
    <div className="mt-6 space-y-2 border-t border-dashed border-border pt-4 text-xs leading-5 text-muted-foreground">
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
