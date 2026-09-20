import { calcPath } from "./seo.ts"

/** 홈에 적는 실제 사용 장면. 슬로건이 아니라 그 순간에 여는 화면. */
export const HOME_USES_HEADING = {
  title: "이런 때 엽니다",
  blurb: "검색어가 아니라, 숫자 앞에서 실제로 하는 일입니다.",
} as const

export const HOME_USES = [
  {
    id: "offer",
    title: "이직 제안 두 장을 받았을 때",
    body: "세전 연봉만 보면 식대·청년 감면·퇴사 후 건보가 빠집니다. 두 회사 조건을 나란히 넣고, 실수령으로 다시 봅니다.",
    href: calcPath("offer-compare"),
    link: "연봉 비교",
  },
  {
    id: "move",
    title: "전세 재계약과 월세 제시가 동시에 올 때",
    body: "전환율 상한으로 월세를 바꿔 보고, 전세대출 이자까지 더한 월 부담을 견줍니다. 집값 상승은 넣지 않습니다.",
    href: calcPath("jeonse-vs-rent"),
    link: "전세 vs 월세",
  },
  {
    id: "buy",
    title: "잔금일 전에 현금이 모자란지 볼 때",
    body: "매매가 말고 취득세·복비 상한·인지세를 더한 뒤, 잔금 전에 준비할 현금을 봅니다. 이사비·법무사 보수는 빠져 있습니다.",
    href: calcPath("closing-cost"),
    link: "살 때 총비용",
  },
  {
    id: "wage",
    title: "알바 시급이 고시보다 낮은지 볼 때",
    body: "계약 시급을 올해 최저임금과 비교한 뒤, 주휴를 넣은 월급을 셉니다. 시급 칸에 월급을 넣으면 자릿수가 어긋납니다.",
    href: calcPath("min-wage"),
    link: "최저임금",
  },
] as const
