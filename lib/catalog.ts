export type LifeGroup = "today" | "rent" | "buy"

export type CalcItem = {
  slug: string
  title: string
  blurb: string
  when: string
  group: LifeGroup
}

export const GROUPS: { id: LifeGroup; title: string; subtitle: string }[] = [
  {
    id: "today",
    title: "오늘 쓰는",
    subtitle: "밥값, 할인, 부가세처럼 지금 바로 쓰는 계산",
  },
  {
    id: "rent",
    title: "빌릴 때",
    subtitle: "전월세 계약 전에 복비와 초기 목돈만 확인",
  },
  {
    id: "buy",
    title: "살 때",
    subtitle: "집값 말고 실제로 나가는 세금·대출·수익률",
  },
]

export const CALCULATORS: CalcItem[] = [
  {
    slug: "quick",
    title: "바로 계산",
    blurb: "표준 계산기처럼 두드리고, 기록으로 이어 계산합니다.",
    when: "사칙연산, 비율, 제곱, 기억하기",
    group: "today",
  },
  {
    slug: "dutch",
    title: "더치페이",
    blurb: "인원만 넣으면 1인 금액과 남는 원까지.",
    when: "모임, 회식, 여행 정산",
    group: "today",
  },
  {
    slug: "sale-vat",
    title: "할인·부가세",
    blurb: "세일가와 10% 부가세를 한 화면에서.",
    when: "쇼핑, 견적, 세금계산서",
    group: "today",
  },
  {
    slug: "brokerage",
    title: "중개수수료",
    blurb: "매매·전세·월세 법정 상한을 바로 확인.",
    when: "부동산 계약 전 복비 협의",
    group: "rent",
  },
  {
    slug: "moving",
    title: "자취 초기비용",
    blurb: "보증금, 복비, 이사비까지 첫 달 목돈.",
    when: "원룸·오피스텔 계약 준비",
    group: "rent",
  },
  {
    slug: "jeonse",
    title: "전세대출 이자",
    blurb: "이자만 내는 전세자금의 월 부담.",
    when: "전세 계약과 대출 한도 가늠",
    group: "rent",
  },
  {
    slug: "acquisition",
    title: "취득세",
    blurb: "1주택·중과·생애최초를 짧게 추정.",
    when: "매수 전 취득세·지방교육세",
    group: "buy",
  },
  {
    slug: "closing-cost",
    title: "살 때 총비용",
    blurb: "취득세, 복비, 법무사, 인지세를 한 장으로.",
    when: "잔금 전 필요 현금 확인",
    group: "buy",
  },
  {
    slug: "mortgage",
    title: "주택담보대출",
    blurb: "원리금균등·원금균등 월 납입을 비교.",
    when: "매수 후 갚는 금액",
    group: "buy",
  },
  {
    slug: "yield",
    title: "임대수익률",
    blurb: "보증금을 뺀 실질 수익률을 바로.",
    when: "전월세 놓는 집, 투자 비교",
    group: "buy",
  },
]

export function getCalculator(slug: string) {
  return CALCULATORS.find((item) => item.slug === slug)
}
