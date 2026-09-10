export type LifeGroup = "today" | "work" | "rent" | "buy" | "loan"

export type CalcItem = {
  slug: string
  title: string
  blurb: string
  when: string
  group: LifeGroup
}

/** 홈 카탈로그 섹션 제목·한 줄 설명. 슬로건이 아니라 그 칸에서 하는 계산만. */
export const CATALOG_HEADINGS = {
  today: {
    title: "생활",
    blurb: "더치페이, 사다리타기, 자동차 취득세.",
  },
  work: {
    title: "급여",
    blurb: "실수령, 최저임금, 주휴·연차·퇴직금. 근로기준법·세법 기준.",
  },
  realty: {
    title: "부동산",
    blurb: "취득·보유·양도, 전월세, 대출 한도. 법령·고시.",
  },
} as const

export const GROUPS: { id: LifeGroup; title: string; subtitle: string }[] = [
  {
    id: "today",
    title: CATALOG_HEADINGS.today.title,
    subtitle: CATALOG_HEADINGS.today.blurb,
  },
  {
    id: "work",
    title: CATALOG_HEADINGS.work.title,
    subtitle: CATALOG_HEADINGS.work.blurb,
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
    blurb: "더하고 나누면 식 아래 결과가 남습니다.",
    when: "사칙연산, 비율, 제곱, 기억하기",
    group: "today",
  },
  {
    slug: "dutch",
    title: "더치페이",
    blurb: "총액을 나누고, 1인 금액과 남는 원까지 보여 줍니다.",
    when: "모임, 회식, 여행 정산",
    group: "today",
  },
  {
    slug: "ladder",
    title: "사다리타기",
    blurb: "출발과 도착을 넣으면 누가 어디로 가는지 정해집니다.",
    when: "회식·내기·역할 정하기",
    group: "today",
  },
  {
    slug: "sale-vat",
    title: "할인·부가세",
    blurb: "세일가와 부가세 10% 포함·별도 금액을 서로 바꿉니다.",
    when: "쇼핑, 견적, 세금계산서",
    group: "today",
  },
  {
    slug: "vehicle-tax",
    title: "자동차 취득세",
    blurb: "출고·이전 때 내는 취득세입니다. 비영업 승용 7%, 경형 4%입니다.",
    when: "출고·이전 등록 전에",
    group: "today",
  },
  {
    slug: "car-tax",
    title: "자동차세",
    blurb: "배기량과 최초 등록 후 연수로 6월·12월 자동차세를 셉니다.",
    when: "6월·12월 고지 전에",
    group: "today",
  },
  {
    slug: "import-duty",
    title: "해외직구 관세·부가세",
    blurb: "목록통관·소액면세 한도를 보고, 넣은 관세에 부가세 10%를 붙입니다.",
    when: "해외 쇼핑몰 결제 전에",
    group: "today",
  },
  {
    slug: "deposit",
    title: "예적금",
    blurb: "넣은 이율로 단리와 월복리를 세고, 세후면 이자에서 15.4%를 뗍니다.",
    when: "예금·적금 만기 가늠",
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
    slug: "offer-compare",
    title: "연봉 vs 이직 제안",
    blurb: "지금 직장과 이직 제안의 세후를 나란히 봅니다.",
    when: "이직 제안을 받았을 때",
    group: "work",
  },
  {
    slug: "weekly-holiday",
    title: "주휴수당",
    blurb: "주 15시간 이상 개근한 주의 유급 주휴를 셉니다.",
    when: "시급·알바 계약 전에",
    group: "work",
  },
  {
    slug: "min-wage",
    title: "최저임금",
    blurb: "고시 시급·월급과, 넣은 시급을 월로 바꾼 값을 견줍니다.",
    when: "시급·월급 계약이 최저인지",
    group: "work",
  },
  {
    slug: "part-time-month",
    title: "알바 월급",
    blurb: "시급에 주휴를 더해 한 달 수입으로 환산합니다.",
    when: "시급 알바 월 수입",
    group: "work",
  },
  {
    slug: "prorate-pay",
    title: "월급 일할",
    blurb: "입사·퇴사 달의 월급을 근무일 또는 30일로 나눕니다.",
    when: "입사·퇴사 달 정산",
    group: "work",
  },
  {
    slug: "overtime-pay",
    title: "연장·야간·휴일 수당",
    blurb: "연장은 1.5배, 야간은 가산 50%, 휴일은 8시간까지 1.5배·초과는 2배입니다.",
    when: "연장·야근·휴일 근무 정산",
    group: "work",
  },
  {
    slug: "annual-leave",
    title: "연차 일수·수당",
    blurb: "근속에 따른 연차 일수와 미사용 수당을 셉니다.",
    when: "입사 1년, 퇴사 정산",
    group: "work",
  },
  {
    slug: "severance",
    title: "퇴직금",
    blurb: "퇴직 전 3개월 평균임금 30일분에 근속연수를 곱합니다.",
    when: "퇴사일 정하기 전에",
    group: "work",
  },
  {
    slug: "retirement-tax",
    title: "퇴직소득세",
    blurb: "퇴직금에서 근속연수공제를 반영한 세금을 봅니다.",
    when: "퇴직금에서 세금이 얼마나 빠지는지",
    group: "work",
  },
  {
    slug: "parental-leave",
    title: "육아휴직 급여",
    blurb: "고용보험 육아휴직 급여를 월 상한·하한에 맞춰 셉니다.",
    when: "육아휴직 기간을 정할 때",
    group: "work",
  },
  {
    slug: "maternity-leave",
    title: "출산전후휴가 급여",
    blurb: "유급 일수와 고용보험 상한을, 우선지원 여부까지 나눠 봅니다.",
    when: "출산전후휴가 기간을 정할 때",
    group: "work",
  },
  {
    slug: "side-job-tax",
    title: "알바 3.3% vs 종소세",
    blurb: "원천 3.3%와 5월 종합소득세를 나란히 비교합니다.",
    when: "알바·배달·프리랜서 정산",
    group: "work",
  },
  {
    slug: "benefit-net",
    title: "지원금",
    blurb: "실업급여와 훈련장려금이 실수령에 얼마나 붙는지 봅니다.",
    when: "퇴직·훈련 지원금을 받을 때",
    group: "work",
  },
  {
    slug: "cert-payback",
    title: "자격",
    blurb: "자격증 비용을 세후 연봉 상승으로 몇 달에 회수하는지 봅니다.",
    when: "자격증 수강 전에",
    group: "work",
  },
  {
    slug: "brokerage",
    title: "중개수수료",
    blurb: "매매·전세·월세 중개보수의 법정 상한을 보여 줍니다.",
    when: "부동산 계약 전 복비 협의",
    group: "rent",
  },
  {
    slug: "moving",
    title: "이사 총액",
    blurb: "복비·이삿짐·보증금에서 대출을 뺀 이사 당일 현금을 셉니다.",
    when: "전월세 계약 전 당일 현금",
    group: "rent",
  },
  {
    slug: "jeonse",
    title: "전세대출 이자",
    blurb: "이자만 내는 전세자금의 월 이자를 가늠합니다.",
    when: "전세 계약과 대출 한도 가늠",
    group: "rent",
  },
  {
    slug: "rent-convert",
    title: "전월세 전환율",
    blurb: "기준금리에 2%p를 더한 상한으로 전세와 월세를 바꿉니다.",
    when: "보증금을 월세로 나눌 때",
    group: "rent",
  },
  {
    slug: "jeonse-vs-rent",
    title: "전세 vs 월세",
    blurb: "같은 집을 전세로 둘 때와 월세로 둘 때 월 부담을 견줍니다.",
    when: "전세와 월세 중 고를 때",
    group: "rent",
  },
  {
    slug: "rent-credit",
    title: "월세 세액공제",
    blurb: "무주택 근로자면 연 월세의 15% 또는 17%를 세액에서 깎습니다.",
    when: "연말정산 월세 공제",
    group: "rent",
  },
  {
    slug: "acquisition",
    title: "취득세",
    blurb: "주택 수와 집값에 따라 살 때 내는 취득세를 셉니다.",
    when: "매수 전 취득세·지방교육세",
    group: "buy",
  },
  {
    slug: "capital-gains",
    title: "양도세",
    blurb: "집을 팔 때 양도세입니다. 1주택 비과세는 직접 고르세요.",
    when: "주택을 팔기 전",
    group: "buy",
  },
  {
    slug: "corporate-gains",
    title: "법인 양도세",
    blurb: "법인이 부동산을 팔 때 법인세와 추가과세를 가늠합니다.",
    when: "법인 명의 매각",
    group: "buy",
  },
  {
    slug: "holding-tax",
    title: "보유세",
    blurb: "재산세와 종합부동산세를 같이 가늠합니다.",
    when: "공시가격이 나온 뒤",
    group: "buy",
  },
  {
    slug: "license-tax",
    title: "등록면허세",
    blurb: "상속·증여 등기 때 내는 등록면허세를 셉니다.",
    when: "무상 이전 등기",
    group: "buy",
  },
  {
    slug: "gift-tax",
    title: "증여세",
    blurb: "누구에게 주는지에 따라 공제가 갈리는 증여세를 셉니다.",
    when: "집을 무상으로 줄 때",
    group: "buy",
  },
  {
    slug: "inheritance",
    title: "상속세",
    blurb: "일괄공제와 배우자공제부터 상속세를 가늠합니다.",
    when: "상속세가 나올지 가늠",
    group: "buy",
  },
  {
    slug: "encumbered-gift",
    title: "부담부증여",
    blurb: "빚을 떠안은 증여의 증여세와 양도세를 같이 봅니다.",
    when: "전세·대출을 안고 증여",
    group: "buy",
  },
  {
    slug: "closing-cost",
    title: "살 때 총비용",
    blurb: "취득세·복비 상한·인지세를 더해 잔금 전 현금을 봅니다.",
    when: "잔금 전 필요 현금 확인",
    group: "buy",
  },
  {
    slug: "pyeong",
    title: "평·㎡",
    blurb: "1평은 약 3.3058㎡입니다. 평당가와 ㎡당가도 같이 나옵니다.",
    when: "매물 면적, 평당가",
    group: "buy",
  },
  {
    slug: "ltv",
    title: "LTV",
    blurb: "규제지역과 생애최초에 따라 집값 대비 대출 한도를 봅니다.",
    when: "주택구입 주담대 한도 가늠",
    group: "loan",
  },
  {
    slug: "dsr",
    title: "DSR",
    blurb: "모든 대출 원리금을 소득으로 나눈 은행 40%·비은행 50% 한도입니다.",
    when: "소득 대비 원리금 한도",
    group: "loan",
  },
  {
    slug: "loan-interest",
    title: "대출 이자",
    blurb: "원리금균등·원금균등·만기일시의 월 납입을 비교합니다.",
    when: "신용·담보 대출 월 납입",
    group: "loan",
  },
  {
    slug: "mortgage",
    title: "주택담보대출",
    blurb: "이미 정해진 주담대 원금의 원리금균등·원금균등 월 납입입니다.",
    when: "매수 후 갚는 금액",
    group: "buy",
  },
  {
    slug: "yield",
    title: "임대수익률",
    blurb: "연 월세를 매매가와, 보증금을 뺀 투입금으로 나눈 수익률입니다.",
    when: "전월세 놓는 집, 투자 비교",
    group: "buy",
  },
]

export function getCalculator(slug: string) {
  return CALCULATORS.find((item) => item.slug === slug)
}
