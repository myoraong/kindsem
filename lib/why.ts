/** 홈 제목. 생활·급여 섹션과 같은 크기로 둔다. */
export const HOME_WHY_HEADING = {
  title: "다른 점",
  blurb: "한곳에서 세고, 고시는 다시 읽고, 표에 없는 숫자는 빼 둡니다.",
} as const

/** 홈에 적는 다른 점. 슬로건이 아니라 계산이 실제로 하는 일만. */
export const HOME_WHY = [
  {
    id: "together",
    title: "한곳에서",
    body: "실수령액, 주휴·퇴직금, 취득세·복비·DSR을 같은 사이트에서 셉니다.",
  },
  {
    id: "refresh",
    title: "하루에 두 번",
    body: "세율·상한은 법제처·금융위 현행본을 다시 읽습니다. 어제 숫자를 그대로 두지 않습니다.",
  },
  {
    id: "omit",
    title: "빼 둠",
    body: "빠진 공제, 수도권 절대한도, 스트레스 DSR은 표에 없어 결과에 넣지 않습니다.",
  },
] as const
