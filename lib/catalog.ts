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
    blurb: "사칙을 넣으면 식 아래 결과가 나옵니다.",
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
    slug: "ladder",
    title: "사다리타기",
    blurb: "출발과 도착을 넣으면 누가 어디로 가는지 매칭합니다.",
    when: "회식·내기·역할 정하기",
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
    slug: "car-tax",
    title: "자동차세",
    blurb: "비영업 승용 배기량·차령, 전기 정액. 지방교육세 30%.",
    when: "6월·12월 고지 전에",
    group: "today",
  },
  {
    slug: "import-duty",
    title: "해외직구 관세·부가세",
    blurb: "목록통관·소액면세 기준과, 넣은 관세의 부가세 10%.",
    when: "해외 쇼핑몰 결제 전에",
    group: "today",
  },
  {
    slug: "deposit",
    title: "예적금",
    blurb: "넣은 이율로 단리·월복리. 세후는 이자소득세 15.4%.",
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
    blurb: "세후 비교에 감면·퇴직금·퇴사 후 건보까지.",
    when: "이직 제안을 받았을 때",
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
    slug: "min-wage",
    title: "최저임금",
    blurb: "시급↔월급 환산, 고시 최저와 비교. 주휴 포함.",
    when: "시급·월급 계약이 최저인지",
    group: "work",
  },
  {
    slug: "part-time-month",
    title: "알바 월급",
    blurb: "시급×시간, 주휴 포함 월 환산. 시행령 제5조 시간.",
    when: "시급 알바 월 수입",
    group: "work",
  },
  {
    slug: "prorate-pay",
    title: "월급 일할",
    blurb: "달력일 또는 30일로 그 달 근무분.",
    when: "입사·퇴사 달 정산",
    group: "work",
  },
  {
    slug: "overtime-pay",
    title: "연장·야간·휴일 수당",
    blurb: "통상시급에 제56조 가산. 연장 1.5, 야간 0.5, 휴일 1.5·2.0.",
    when: "연장·야근·휴일 근무 정산",
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
    slug: "retirement-tax",
    title: "퇴직소득세",
    blurb: "근속연수공제와 환산급여. 소득세법 제48조.",
    when: "퇴직금에서 세금이 얼마나 빠지는지",
    group: "work",
  },
  {
    slug: "parental-leave",
    title: "육아휴직 급여",
    blurb: "고용보험 시행령 상한·하한·지급률.",
    when: "육아휴직 기간을 정할 때",
    group: "work",
  },
  {
    slug: "maternity-leave",
    title: "출산전후휴가 급여",
    blurb: "고용보험 상한과 근로기준법 유급 일수. 우선지원 여부로 나눕니다.",
    when: "출산전후휴가 기간을 정할 때",
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
    slug: "jeonse-vs-rent",
    title: "전세 vs 월세",
    blurb: "법정 전환 상한으로 월 부담을 비교.",
    when: "전세와 월세 중 고를 때",
    group: "rent",
  },
  {
    slug: "rent-credit",
    title: "월세 세액공제",
    blurb: "무주택·총급여 8천 이하, 연 1천만 한도 15·17%.",
    when: "연말정산 월세 공제",
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
    blurb: "누구에게 주는지, 10년 합산, 10~50% 누진.",
    when: "집을 무상으로 줄 때",
    group: "buy",
  },
  {
    slug: "inheritance",
    title: "상속세",
    blurb: "자녀·미성년·경로 인적공제와 일괄·배우자·금융재산 공제.",
    when: "상속세가 나올지 가늠",
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
    slug: "pyeong",
    title: "평·㎡",
    blurb: "1평은 3.3058㎡입니다. 평당·㎡당 가격도 같이.",
    when: "매물 면적, 평당가",
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
    slug: "loan-interest",
    title: "대출 이자",
    blurb: "원리금균등·원금균등·만기일시. 넣은 금리로 월 납입.",
    when: "신용·담보 대출 월 납입",
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
