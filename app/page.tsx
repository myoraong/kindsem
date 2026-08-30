import { HomeBrowse } from "@/components/home-browse"
import { Sena } from "@/components/sena"

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

      <HomeBrowse />
    </div>
  )
}
