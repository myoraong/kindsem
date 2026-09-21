/** 브라우저 탭에 보일 결과. 예: 2,812,935원 · 월 실수령 */
export function resultTabTitle(amount: string, name: string) {
  const money = amount.trim()
  const label = name.trim()
  if (!money) return label
  if (!label) return money
  return `${money} · ${label}`
}
