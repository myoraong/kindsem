/** 금액 단추와 칸의 숫자가 같은지 봅니다. 쉼표는 빼고 비교합니다. */
export function chipMatches(current: string | undefined, option: string) {
  const left = (current ?? "").replace(/,/g, "")
  if (!left) return false
  return left === option.replace(/,/g, "")
}
