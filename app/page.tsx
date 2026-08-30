import { AdSenseInPage } from "@/components/adsense-inpage"
import { HomeBrowse } from "@/components/home-browse"
import { JsonLd } from "@/components/json-ld"
import { Sena } from "@/components/sena"
import { HOME_METADATA, homeJsonLd } from "@/lib/seo"

export const metadata = HOME_METADATA

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <JsonLd data={homeJsonLd()} />
      <section className="flex items-center gap-4 sm:gap-6 md:gap-8">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary">생활 · 급여 · 부동산</p>
          <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl md:text-4xl">
            생활·급여·부동산 계산기
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            실수령액, 주휴수당, 퇴직금, 취득세, 중개수수료, 자동차세, 양도세, DSR.
          </p>
        </div>
        <figure className="w-[4.5rem] shrink-0 sm:w-[5.25rem] md:w-24 lg:w-[6.5rem]">
          <Sena className="sena-bob" priority />
        </figure>
      </section>

      <HomeBrowse />
      <AdSenseInPage />
    </div>
  )
}
