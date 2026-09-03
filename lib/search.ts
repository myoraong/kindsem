import { CALCULATORS, type CalcItem, type LifeGroup } from "./catalog.ts"
import type { HomeSection } from "./home-section.ts"
import { calcSearchText } from "./seo.ts"

const REALTY_GROUPS = new Set<LifeGroup>(["rent", "buy", "loan"])

export function itemInHomeSection(item: CalcItem, section: HomeSection) {
  if (section === "all") return true
  if (section === "today") return item.group === "today"
  if (section === "work") return item.group === "work"
  return REALTY_GROUPS.has(item.group)
}

const GROUP_LABEL: Record<LifeGroup, string> = {
  today: "생활",
  work: "급여",
  rent: "부동산",
  buy: "부동산",
  loan: "부동산",
}

/** 제목·설명에 없는 말로도 찾게 하는 별칭. 법령 숫자가 아니라 부르는 이름만. */
const ALIASES: Record<string, string[]> = {
  quick: ["계산기", "사칙", "산수"],
  dutch: ["더치", "엔빵", "n빵", "더치페이"],
  ladder: ["사다리", "사다리게임", "사다리타기", "제비뽑기"],
  "sale-vat": ["부가세", "부가가치세", "할인", "세일", "vat"],
  "vehicle-tax": ["취등록세", "차량취득세", "자동차취득세", "출고세금"],
  "car-tax": ["자동차세", "보유자동차세", "배기량세", "차령", "자동차세계산기"],
  "import-duty": ["해외직구", "관세", "직구", "목록통관", "소액면세", "부가세"],
  deposit: ["예금", "적금", "복리", "단리", "예적금", "이자"],
  "take-home": [
    "월급",
    "실수령",
    "실수령액",
    "넷페이",
    "세후",
    "세후월급",
    "연봉",
    "4대보험",
    "실수령액계산기",
    "월급계산기",
    "연봉계산기",
  ],
  "weekly-holiday": ["주휴", "주휴수당", "주휴일", "주휴일수당", "주휴수당계산기"],
  "min-wage": ["최저임금", "최저시급", "최저임금월급", "시급최저"],
  "part-time-month": ["알바월급", "시급월급", "알바비"],
  "prorate-pay": ["일할", "월급일할", "퇴사정산", "입사정산"],
  "overtime-pay": ["연장", "야간", "휴일수당", "연장수당", "야간수당", "특근"],
  "parental-leave": ["육아휴직", "육휴", "육아휴직급여"],
  "maternity-leave": ["출산전후휴가", "출산휴가", "출산휴가급여", "출산전후"],
  "annual-leave": ["연차", "연차수당", "연차일수", "휴가"],
  severance: ["퇴직", "퇴직금", "평균임금", "퇴직금계산기"],
  "retirement-tax": ["퇴직소득세", "퇴직금세금", "퇴직소득", "퇴직원천징수"],
  "offer-compare": ["이직", "연봉비교", "제안"],
  "side-job-tax": ["알바", "3.3", "프리랜서", "종소세"],
  "benefit-net": ["실업급여", "내일배움", "지원금"],
  "cert-payback": ["자격증", "자격"],
  brokerage: ["복비", "복비얼마", "중개", "중개보수", "수수료", "복비계산기", "중개수수료계산기"],
  moving: ["이사", "이사비용", "이사비"],
  jeonse: ["전세대출", "전세이자"],
  "rent-convert": ["전월세", "전환율", "반전세", "월세전환"],
  "rent-credit": ["월세공제", "월세세액공제", "청년월세"],
  "jeonse-vs-rent": ["전세월세", "전세vs월세", "전세대비", "월세비교"],
  acquisition: ["주택취득세", "집취득세", "살때세금", "취득세계산기"],
  "capital-gains": ["양도", "양도소득세"],
  "corporate-gains": ["법인양도", "법인세"],
  "holding-tax": ["재산세", "종부세", "보유"],
  "license-tax": ["등록세", "등록면허"],
  "gift-tax": ["증여", "증여세", "자녀증여"],
  inheritance: ["상속", "상속세", "일괄공제", "인적공제", "금융재산공제", "며느리"],
  "encumbered-gift": ["부담부", "채무증여"],
  "closing-cost": ["총비용", "잔금", "살때"],
  ltv: ["엘티비", "주택담보비율"],
  dsr: ["디에스알", "총부채원리금"],
  "loan-interest": ["대출이자", "대출상환", "원리금균등", "원금균등", "만기일시"],
  mortgage: ["주담대", "주택담보", "원리금"],
  yield: ["수익률", "임대수익"],
}

function compact(value: string) {
  return value.toLowerCase().replace(/\s+/g, "")
}

export function groupLabel(group: LifeGroup) {
  return GROUP_LABEL[group]
}

export function searchCalculators(query: string, section: HomeSection = "all"): CalcItem[] {
  const tokens = query
    .trim()
    .split(/\s+/)
    .map(compact)
    .filter(Boolean)
  if (tokens.length === 0) return []

  const hits: { item: CalcItem; rank: number }[] = []
  for (const item of CALCULATORS) {
    if (!itemInHomeSection(item, section)) continue
    const aliases = ALIASES[item.slug] ?? []
    const strong = compact(
      [item.title, item.slug, groupLabel(item.group), calcSearchText(item.slug), ...aliases].join(" "),
    )
    const hay = compact([item.blurb, item.when, strong].join(" "))
    if (!tokens.every((token) => hay.includes(token))) continue
    hits.push({
      item,
      rank: tokens.filter((token) => strong.includes(token)).length,
    })
  }
  hits.sort((a, b) => b.rank - a.rank)
  return hits.map((row) => row.item)
}
