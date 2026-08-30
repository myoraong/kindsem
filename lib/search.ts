import { CALCULATORS, type CalcItem, type LifeGroup } from "./catalog.ts"

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
  "sale-vat": ["부가세", "부가가치세", "할인", "세일", "vat"],
  "vehicle-tax": ["자동차", "차량", "취등록세", "차세금", "자동차세"],
  "take-home": ["월급", "실수령", "세후", "연봉", "4대보험"],
  "weekly-holiday": ["주휴", "주휴수당", "주휴일"],
  "annual-leave": ["연차", "연차수당", "연차일수", "휴가"],
  severance: ["퇴직", "퇴직금", "평균임금"],
  "offer-compare": ["이직", "연봉비교", "제안"],
  "side-job-tax": ["알바", "3.3", "프리랜서", "종소세"],
  "benefit-net": ["실업급여", "내일배움", "지원금"],
  "cert-payback": ["자격증", "자격"],
  brokerage: ["복비", "중개", "중개보수", "수수료"],
  moving: ["이사", "이사비용", "이사비"],
  jeonse: ["전세대출", "전세이자"],
  "rent-convert": ["전월세", "전환율", "반전세", "월세전환"],
  acquisition: ["주택취득세", "집취득세", "살때세금"],
  "capital-gains": ["양도", "양도소득세"],
  "corporate-gains": ["법인양도", "법인세"],
  "holding-tax": ["재산세", "종부세", "보유"],
  "license-tax": ["등록세", "등록면허"],
  "gift-tax": ["증여"],
  inheritance: ["상속"],
  "encumbered-gift": ["부담부", "채무증여"],
  "closing-cost": ["총비용", "잔금", "살때"],
  ltv: ["엘티비", "주택담보비율"],
  dsr: ["디에스알", "총부채원리금"],
  mortgage: ["주담대", "주택담보", "원리금"],
  yield: ["수익률", "임대수익"],
}

function compact(value: string) {
  return value.toLowerCase().replace(/\s+/g, "")
}

export function groupLabel(group: LifeGroup) {
  return GROUP_LABEL[group]
}

export function searchCalculators(query: string): CalcItem[] {
  const tokens = query
    .trim()
    .split(/\s+/)
    .map(compact)
    .filter(Boolean)
  if (tokens.length === 0) return []

  return CALCULATORS.filter((item) => {
    const hay = compact(
      [item.title, item.blurb, item.when, item.slug, groupLabel(item.group), ...(ALIASES[item.slug] ?? [])].join(
        " ",
      ),
    )
    return tokens.every((token) => hay.includes(token))
  })
}
