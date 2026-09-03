import { RealtyCatalog } from "@/components/realty-catalog"
import { JsonLd } from "@/components/json-ld"
import { CALCULATORS } from "@/lib/catalog"
import { REALTY_METADATA, calcSeo, calcUrl } from "@/lib/seo"

export const metadata = REALTY_METADATA

function realtyJsonLd() {
  const items = CALCULATORS.filter((item) => item.group !== "today" && item.group !== "work")
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "카인드셈 부동산 계산기",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: calcSeo(item.slug).query,
      url: calcUrl(item.slug),
    })),
  }
}

export default function RealtyPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <JsonLd data={realtyJsonLd()} />
      <p className="text-sm font-medium text-primary">부동산</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl">
        부동산 계산기
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
        세율·공제 한도는 현행 법령입니다. 빠진 공제·사실관계가 있으면 신고 세액이 달라집니다. 신고는
        세무사와 확인하세요.
      </p>
      <div className="mt-8">
        <RealtyCatalog />
      </div>
    </div>
  )
}

