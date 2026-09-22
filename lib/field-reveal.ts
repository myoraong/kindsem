/** 휴대폰 결과 막대(제목·금액·다음 계산)가 입력칸을 가리는 높이입니다. */
export const MOBILE_RESULT_DOCK_PX = 148

/** 입력칸이 헤더나 아래 막대에 가려지면 올려야 합니다. */
export function fieldNeedsReveal(
  rect: { top: number; bottom: number },
  viewportHeight: number,
  topInset = 72,
  bottomInset = 0,
) {
  if (viewportHeight <= 0) return false
  return rect.top < topInset || rect.bottom > viewportHeight - bottomInset
}
