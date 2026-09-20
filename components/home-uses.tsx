import Link from "next/link"
import { HOME_USES, HOME_USES_HEADING } from "@/lib/home-uses"

export function HomeUses() {
  return (
    <section aria-labelledby="home-uses-heading" className="mt-10">
      <header className="mb-3 min-w-0">
        <h2
          id="home-uses-heading"
          className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]"
        >
          {HOME_USES_HEADING.title}
        </h2>
        <p className="mt-0.5 max-w-2xl text-pretty break-keep text-sm leading-6 text-muted-foreground sm:text-[15px]">
          {HOME_USES_HEADING.blurb}
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {HOME_USES.map((item) => (
          <li key={item.id}>
            <article className="flex h-full flex-col rounded-2xl bg-card p-4 ring-1 ring-foreground/8 sm:p-5">
              <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-1.5 flex-1 text-pretty break-keep text-[13px] leading-6 text-muted-foreground">
                {item.body}
              </p>
              <Link
                href={item.href}
                className="mt-3 text-sm font-medium text-foreground underline underline-offset-2"
              >
                {item.link}
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
