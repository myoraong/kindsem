import type { Metadata } from "next"
import type { CalcItem } from "./catalog.ts"
import { CALCULATORS } from "./catalog.ts"
import { SITE_NAME, SITE_URL } from "./site.ts"

export type CalcSeo = {
  /** 검색창에 넣는 대표 말. 페이지 제목·H1. */
  query: string
  /** 같은 계산을 부르는 다른 검색어. 페이지에 보이게 둡니다. */
  also: string[]
}

/**
 * 계산기마다 사람들이 실제로 넣는 검색어.
 * 카드 짧은 제목(catalog title)과 따로 둡니다.
 */
export const CALC_SEO: Record<string, CalcSeo> = {
  quick: {
    query: "사칙연산 계산기",
    also: ["계산기", "비율 계산", "제곱 계산"],
  },
  dutch: {
    query: "더치페이 계산기",
    also: ["엔빵 계산기", "n빵 계산기", "더치페이", "더치"],
  },
  ladder: {
    query: "사다리타기 계산기",
    also: ["사다리게임", "사다리 타기", "제비뽑기"],
  },
  "sale-vat": {
    query: "부가세 계산기",
    also: ["부가가치세 계산기", "할인 계산기", "VAT 계산기", "세일 부가세"],
  },
  "vehicle-tax": {
    query: "자동차 취득세 계산기",
    also: ["자동차취득세", "차량 취등록세 계산기", "취등록세 계산기", "출고세금"],
  },
  "car-tax": {
    query: "자동차세 계산기",
    also: ["자동차세 조회", "배기량 자동차세", "전기차 자동차세", "차령 자동차세"],
  },
  "import-duty": {
    query: "해외직구 관세 계산기",
    also: ["직구 관세 계산기", "해외직구 부가세", "목록통관", "소액면세"],
  },
  deposit: {
    query: "예적금 이자 계산기",
    also: ["적금 이자 계산기", "예금 이자 계산기", "복리 계산기", "단리 계산기"],
  },
  "take-home": {
    query: "실수령액 계산기",
    also: ["월급 실수령 계산기", "연봉 실수령액", "세후 월급 계산기", "4대보험 계산기", "넷페이"],
  },
  "weekly-holiday": {
    query: "주휴수당 계산기",
    also: ["주휴 계산기", "주휴일수당", "알바 주휴수당", "주휴일"],
  },
  "min-wage": {
    query: "최저임금 계산기",
    also: ["최저시급 계산기", "최저임금 월급", "시급 최저임금", "2026 최저임금"],
  },
  "part-time-month": {
    query: "알바 월급 계산기",
    also: ["시급 월급 계산기", "알바비 계산기", "시급 주휴 월급"],
  },
  "prorate-pay": {
    query: "월급 일할 계산기",
    also: ["입사 정산 계산기", "퇴사 정산 계산기", "월급 일할계산"],
  },
  "overtime-pay": {
    query: "연장수당 계산기",
    also: ["야간수당 계산기", "휴일수당 계산기", "특근 수당", "연장 야간 휴일"],
  },
  "annual-leave": {
    query: "연차수당 계산기",
    also: ["연차 일수 계산기", "연차 계산기", "미사용 연차수당"],
  },
  severance: {
    query: "퇴직금 계산기",
    also: ["퇴직금 평균임금", "법정 퇴직금", "퇴직 정산"],
  },
  "parental-leave": {
    query: "육아휴직 급여 계산기",
    also: ["육아휴직 계산기", "육휴 급여", "고용보험 육아휴직"],
  },
  "maternity-leave": {
    query: "출산전후휴가 급여 계산기",
    also: ["출산휴가 급여 계산기", "출산휴가 계산기", "고용보험 출산전후휴가"],
  },
  "offer-compare": {
    query: "연봉 비교 계산기",
    also: ["이직 연봉 비교", "세후 연봉 비교", "이직 제안 계산"],
  },
  "side-job-tax": {
    query: "알바 3.3% 계산기",
    also: ["3.3 원천징수 계산기", "프리랜서 세금 계산기", "종소세 비교"],
  },
  "benefit-net": {
    query: "실업급여 계산기",
    also: ["내일배움카드 계산", "지원금 실수령", "구직급여"],
  },
  "cert-payback": {
    query: "자격증 회수 계산기",
    also: ["자격증 비용 회수", "자격증 연봉 상승"],
  },
  brokerage: {
    query: "중개수수료 계산기",
    also: ["복비 계산기", "부동산 중개보수", "복비 얼마", "중개수수료 상한"],
  },
  moving: {
    query: "이사비용 계산기",
    also: ["이사 총액 계산기", "이사비 계산", "전월세 이사 비용"],
  },
  jeonse: {
    query: "전세대출 이자 계산기",
    also: ["전세자금대출 이자", "전세 이자 계산", "전세대출 월이자"],
  },
  "rent-convert": {
    query: "전월세 전환율 계산기",
    also: ["전세 월세 전환 계산기", "반전세 계산기", "월세 전환율"],
  },
  "jeonse-vs-rent": {
    query: "전세 월세 비교 계산기",
    also: ["전세 vs 월세", "전세대비 월세", "전세월세 계산"],
  },
  "rent-credit": {
    query: "월세 세액공제 계산기",
    also: ["월세공제 계산기", "청년 월세 공제", "연말정산 월세"],
  },
  acquisition: {
    query: "취득세 계산기",
    also: ["주택 취득세 계산기", "집 취득세", "살 때 세금", "취득세 지방교육세"],
  },
  "capital-gains": {
    query: "양도소득세 계산기",
    also: ["양도세 계산기", "주택 양도세", "1주택 비과세"],
  },
  "corporate-gains": {
    query: "법인 양도세 계산기",
    also: ["법인 부동산 양도", "법인세 추가과세"],
  },
  "holding-tax": {
    query: "재산세 계산기",
    also: ["종부세 계산기", "보유세 계산기", "종합부동산세"],
  },
  "license-tax": {
    query: "등록면허세 계산기",
    also: ["등록세 계산기", "상속 증여 등록세"],
  },
  "gift-tax": {
    query: "증여세 계산기",
    also: ["증여세율", "증여 공제", "주택 증여세"],
  },
  inheritance: {
    query: "상속세 계산기",
    also: ["상속세 일괄공제", "배우자공제 상속세"],
  },
  "encumbered-gift": {
    query: "부담부증여 계산기",
    also: ["채무 승계 증여", "부담부 증여세 양도세"],
  },
  "closing-cost": {
    query: "부동산 취득 총비용 계산기",
    also: ["살 때 총비용", "잔금 필요 현금", "취득세 복비 인지세"],
  },
  ltv: {
    query: "LTV 계산기",
    also: ["엘티비 계산기", "주택담보대출 한도", "생애최초 LTV"],
  },
  dsr: {
    query: "DSR 계산기",
    also: ["디에스알 계산기", "총부채원리금상환비율", "DSR 40%"],
  },
  "loan-interest": {
    query: "대출 이자 계산기",
    also: ["대출이자 계산기", "원리금균등 상환 계산기", "원금균등 계산기"],
  },
  mortgage: {
    query: "주택담보대출 계산기",
    also: ["주담대 계산기", "원리금균등 계산기", "주택담보 월납입"],
  },
  yield: {
    query: "임대수익률 계산기",
    also: ["부동산 수익률 계산기", "전월세 수익률", "실질 임대수익"],
  },
}

export function calcSeo(slug: string): CalcSeo {
  return CALC_SEO[slug] ?? { query: slug, also: [] }
}

export function calcPath(slug: string) {
  return `/calc/${slug}/`
}

export function calcUrl(slug: string) {
  return `${SITE_URL}${calcPath(slug)}`
}

export function calcDescription(item: CalcItem) {
  const seo = calcSeo(item.slug)
  return `${item.blurb} ${seo.query}.`
}

export function calcSearchText(slug: string) {
  const seo = calcSeo(slug)
  return [seo.query, ...seo.also].join(" ")
}

function pageOpenGraph(title: string, description: string, url: string) {
  return {
    title,
    description,
    url,
    locale: "ko_KR" as const,
    type: "website" as const,
    siteName: SITE_NAME,
  }
}

export function calcMetadata(item: CalcItem): Metadata {
  const seo = calcSeo(item.slug)
  const title = seo.query
  const description = calcDescription(item)
  const url = calcPath(item.slug)
  return {
    title,
    description,
    keywords: [title, ...seo.also, "카인드셈", "Kindsem"],
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: { "ko-KR": url },
    },
    openGraph: pageOpenGraph(`${title} · ${SITE_NAME}`, description, url),
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export function calcJsonLd(item: CalcItem) {
  const seo = calcSeo(item.slug)
  const url = calcUrl(item.slug)
  const group =
    item.group === "work" ? "급여" : item.group === "today" ? "생활" : "부동산"
  const groupPath = item.group === "today" ? "/#today" : item.group === "work" ? "/#work" : "/realty/"
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: seo.query,
      description: calcDescription(item),
      url,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      inLanguage: "ko",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        alternateName: ["Kindsem", "카인드셈"],
        url: SITE_URL,
        logo: `${SITE_URL}/kindsem-sena-icon.png`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: group, item: `${SITE_URL}${groupPath}` },
        { "@type": "ListItem", position: 3, name: seo.query, item: url },
      ],
    },
  ]
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }
}

export function homeJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      alternateName: ["Kindsem", "카인드셈"],
      url: SITE_URL,
      inLanguage: "ko",
      description: HOME_DESCRIPTION,
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        alternateName: ["Kindsem", "카인드셈"],
        url: SITE_URL,
        logo: `${SITE_URL}/kindsem-sena-icon.png`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "카인드셈 계산기",
      itemListElement: CALCULATORS.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: calcSeo(item.slug).query,
        url: calcUrl(item.slug),
      })),
    },
  ]
}

const HOME_TITLE = `생활·급여·부동산 계산기 · ${SITE_NAME}`
const HOME_DESCRIPTION =
  "카인드셈은 실수령액, 주휴수당, 퇴직금, 취득세, 중개수수료, 자동차세, 양도세, DSR 등 40여 가지를 법령·고시 현행본으로 계산하는 무료 계산기입니다. 하루 두 번 법제처에서 세율을 다시 읽고, 표에 없는 공제는 넣지 않습니다."

export const HOME_METADATA: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  keywords: [
    "카인드셈",
    "Kindsem",
    "실수령액 계산기",
    "세후 월급 계산기",
    "퇴직금 계산기",
    "주휴수당 계산기",
    "중개수수료 계산기",
    "복비 계산기",
    "취득세 계산기",
    "양도세 계산기",
    "자동차세 계산기",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/", languages: { "ko-KR": "/" } },
  openGraph: pageOpenGraph(HOME_TITLE, HOME_DESCRIPTION, "/"),
}

export const CALC_INDEX_METADATA: Metadata = {
  title: "계산기 목록",
  description:
    "카인드셈 생활·급여·부동산 계산기 전체. 실수령액, 주휴수당, 퇴직금, 취득세, 중개수수료, 자동차세.",
  keywords: ["계산기 모음", "실수령액 계산기", "취득세 계산기", "카인드셈"],
  robots: { index: true, follow: true },
  alternates: { canonical: "/calc/", languages: { "ko-KR": "/calc/" } },
  openGraph: pageOpenGraph(
    `계산기 목록 · ${SITE_NAME}`,
    "카인드셈 생활·급여·부동산 계산기 전체. 실수령액, 주휴수당, 퇴직금, 취득세, 중개수수료, 자동차세.",
    "/calc/",
  ),
}

export const REALTY_METADATA: Metadata = {
  title: "부동산 계산기",
  description:
    "취득세, 양도세, 증여세, 중개수수료, 전월세 전환율, LTV, DSR 계산기. 법령·고시 기준.",
  keywords: ["부동산 계산기", "취득세 계산기", "양도세 계산기", "중개수수료 계산기", "DSR 계산기", "카인드셈"],
  robots: { index: true, follow: true },
  alternates: { canonical: "/realty/", languages: { "ko-KR": "/realty/" } },
  openGraph: pageOpenGraph(
    `부동산 계산기 · ${SITE_NAME}`,
    "취득세, 양도세, 증여세, 중개수수료, 전월세 전환율, LTV, DSR 계산기. 법령·고시 기준.",
    "/realty/",
  ),
}
