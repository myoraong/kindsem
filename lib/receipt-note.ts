/** 카톡·스크린샷에 남는 결과 카드용. 하단 푸터와 같은 취지, 더 짧게. */
export const RECEIPT_REFERENCE_NOTE =
  "법령·고시 기준 참고용입니다. 빠진 공제·사실관계가 있으면 달라집니다."

/** 실수령·이직 비교. 기본은 연말정산 월평균. */
export const PAY_SLIP_NOTE =
  "연말정산 후 월평균입니다. 회사 명세서는 간이세액표라 다를 수 있습니다."

export function paySlipNote(mode: "settlement" | "withholding") {
  if (mode === "withholding") {
    return "이번 달 명세서입니다. 소득세법 시행령 별표 2(2026.2.27.) 간이세액표를 봅니다."
  }
  return PAY_SLIP_NOTE
}
