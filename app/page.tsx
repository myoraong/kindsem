import { CalcDirRow } from "@/components/calc-card"
import { RealtyCatalog } from "@/components/realty-catalog"
import { Sena } from "@/components/sena"
import { CALCULATORS, GROUPS } from "@/lib/catalog"

const JUMP = [
  { id: "today", label: "생활" },
  { id: "work", label: "급여" },
  { id: "realty", label: "부동산" },
] as const

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <section className="flex items-center gap-4 sm:gap-6 md:gap-8">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary">생활 · 급여 · 부동산</p>
          <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl md:text-4xl">
            어려운 숫자는 친절하게,
            <br />
            오늘 필요한 결과만.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:text-[15px]">
            입력하는 즉시 결과가 나옵니다. 부동산 금액은 만 원 단위입니다.
          </p>
        </div>
        <figure className="w-[4.5rem] shrink-0 sm:w-[5.25rem] md:w-24 lg:w-[6.5rem]">
          <Sena className="sena-bob" priority />
        </figure>
      </section>

      <nav
        aria-label="분류로 이동"
        className="sticky top-[4.25rem] z-20 -mx-4 mt-6 flex gap-2 overflow-x-auto bg-background/90 px-4 py-3 backdrop-blur-md"
      >
        {JUMP.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="inline-flex h-9 shrink-0 items-center rounded-full bg-card px-3.5 text-sm ring-1 ring-foreground/8 hover:bg-accent"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-4 space-y-8">
        {GROUPS.filter((group) => group.id === "today" || group.id === "work").map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-28">
            <h2 className="mb-3 text-lg font-semibold">{group.title}</h2>
            <div className="grid gap-1 rounded-2xl bg-card p-2 ring-1 ring-foreground/8 sm:grid-cols-2">
              {CALCULATORS.filter((item) => item.group === group.id).map((item) => (
                <CalcDirRow key={item.slug} item={item} />
              ))}
            </div>
          </section>
        ))}

        <section id="realty" className="scroll-mt-28">
          <h2 className="mb-3 text-lg font-semibold">부동산</h2>
          <RealtyCatalog />
        </section>
      </div>
    </div>
  )
}
