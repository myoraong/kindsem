export type LifeGroup = "today" | "work" | "rent" | "buy" | "loan"

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
    title: "생활",
    subtitle: "밥값, 할인, 부가세처럼 지금 바로 쓰는 계산",
  },
  {
    id: "work",
    title: "급여",
    subtitle: "실수령, 주휴·연차·퇴직금, 이직 제안을 한 화면에서",
  },
  {
    id: "rent",
    title: "빌릴 때",
    subtitle: "전월세 복비·이사 총액·대출 이자를 한곳에서",
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
    slug: "vehicle-tax",
    title: "자동차 취득세",
    blurb: "비영업 7%·경형 4%와 지방교육세.",
    when: "출고·이전 등록 전에",
    group: "today",
  },
  {
    slug: "take-home",
    title: "실수령",
    blurb: "연봉을 넣으면 4대보험과 세금이 줄줄이 빠집니다.",
    when: "월급 명세서를 보기 전에",
    group: "work",
  },
  {
    slug: "weekly-holiday",
    title: "주휴수당",
    blurb: "주 15시간 이상, 개근한 주의 유급 주휴.",
    when: "시급·알바 계약 전에",
    group: "work",
  },
  {
    slug: "annual-leave",
    title: "연차 일수·수당",
    blurb: "제60조 일수와 미사용 통상임금.",
    when: "입사 1년, 퇴사 정산",
    group: "work",
  },
  {
    slug: "severance",
    title: "퇴직금",
    blurb: "3개월 평균임금 30일분 × 근속연수.",
    when: "퇴사일 정하기 전에",
    group: "work",
  },
  {
    slug: "offer-compare",
    title: "연봉 vs 이직 제안",
    blurb: "세후 비교에 감면·퇴직금·퇴사 후 건보까지.",
    when: "이직 제안을 받았을 때",
    group: "work",
  },
  {
    slug: "side-job-tax",
    title: "알바 3.3% vs 종소세",
    blurb: "원천 3.3%와 종소세를 한 장에서 비교합니다.",
    when: "알바·배달·프리랜서 정산",
    group: "work",
  },
  {
    slug: "benefit-net",
    title: "지원금",
    blurb: "실업급여·내일배움이 실수령에 얼마나 붙는지.",
    when: "퇴직·훈련 지원금을 받을 때",
    group: "work",
  },
  {
    slug: "cert-payback",
    title: "자격",
    blurb: "자격증 비용이 연봉 상승으로 몇 달에 회수되는지.",
    when: "자격증 수강 전에",
    group: "work",
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
    title: "이사 총액",
    blurb: "복비, 이삿짐, 보증금, 대출이자를 한 화면에서.",
    when: "전월세 계약 전 당일 현금",
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
    slug: "rent-convert",
    title: "전월세 전환율",
    blurb: "기준금리+2%p 상한으로 전세↔월세.",
    when: "보증금을 월세로 나눌 때",
    group: "rent",
  },
  {
    slug: "acquisition",
    title: "취득세",
    blurb: "1주택·중과·생애최초 법정 세율.",
    when: "매수 전 취득세·지방교육세",
    group: "buy",
  },
  {
    slug: "capital-gains",
    title: "양도세",
    blurb: "1주택 비과세, 장특공, 다주택 중과를 짧게.",
    when: "주택을 팔기 전",
    group: "buy",
  },
  {
    slug: "corporate-gains",
    title: "법인 양도세",
    blurb: "법인이 부동산을 팔 때 법인세와 추가과세.",
    when: "법인 명의 매각",
    group: "buy",
  },
  {
    slug: "holding-tax",
    title: "보유세",
    blurb: "재산세와 종부세를 한 장으로.",
    when: "공시가격이 나온 뒤",
    group: "buy",
  },
  {
    slug: "license-tax",
    title: "등록면허세",
    blurb: "상속·증여 등기 때 내는 등록세.",
    when: "무상 이전 등기",
    group: "buy",
  },
  {
    slug: "gift-tax",
    title: "증여세",
    blurb: "관계별 공제와 10~50% 누진.",
    when: "집을 무상으로 줄 때",
    group: "buy",
  },
  {
    slug: "inheritance",
    title: "상속세",
    blurb: "일괄공제·배우자공제 최소 한도.",
    when: "상속 재산 가늠",
    group: "buy",
  },
  {
    slug: "encumbered-gift",
    title: "부담부증여",
    blurb: "채무를 넘기면 증여세와 양도세를 같이.",
    when: "전세·대출을 안고 증여",
    group: "buy",
  },
  {
    slug: "closing-cost",
    title: "살 때 총비용",
    blurb: "취득세, 복비 상한, 인지세를 한 장으로.",
    when: "잔금 전 필요 현금 확인",
    group: "buy",
  },
  {
    slug: "ltv",
    title: "LTV",
    blurb: "규제지역·생애최초 한도와 희망 대출이 되는지.",
    when: "주택구입 주담대 한도 가늠",
    group: "loan",
  },
  {
    slug: "dsr",
    title: "DSR",
    blurb: "은행 40%·비은행 50% 한도.",
    when: "소득 대비 원리금 한도",
    group: "loan",
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
