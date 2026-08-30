/**
 * 주택임대차보호법 제7조의2 · 시행령 제9조.
 * 월차임 전환 산정률 상한 = 연 10%와 (한국은행 기준금리 + 2%p) 중 낮은 비율.
 * 기준금리는 한국은행 결정이라 법제처 표에 없고, 사용자가 넣습니다.
 */
export const RENT_CONVERT_FLAT_CAP = 0.1
export const RENT_CONVERT_ADD = 0.02

export function statutoryConvertCap(baseRate: number) {
  if (baseRate < 0) return null
  return Math.min(RENT_CONVERT_FLAT_CAP, baseRate + RENT_CONVERT_ADD)
}

export function calcRentConvert(input: {
  mode: "to-monthly" | "to-jeonse"
  jeonse: number
  deposit: number
  monthly: number
  agreedRate: number
  baseRate: number
}) {
  const cap = statutoryConvertCap(input.baseRate)
  if (cap === null) return null
  const agreed = input.agreedRate
  if (agreed <= 0 && input.mode === "to-monthly" && input.jeonse <= input.deposit) return null
  if (input.mode === "to-monthly") {
    const converted = input.jeonse - input.deposit
    if (converted <= 0) return null
    const rate = agreed > 0 ? agreed : cap
    const overCap = rate > cap
    const monthlyCap = Math.round((converted * cap) / 12)
    const monthlyAgreed = Math.round((converted * rate) / 12)
    return {
      mode: input.mode as const,
      converted,
      cap,
      appliedRate: overCap ? cap : rate,
      overCap,
      monthlyAgreed,
      monthlyCap,
      amount: monthlyCap,
    }
  }
  if (input.monthly <= 0) return null
  const rate = agreed > 0 ? agreed : cap
  const overCap = rate > cap
  const convertedAgreed = Math.round((input.monthly * 12) / rate)
  const convertedCap = Math.round((input.monthly * 12) / cap)
  return {
    mode: input.mode as const,
    converted: convertedCap,
    cap,
    appliedRate: overCap ? cap : rate,
    overCap,
    monthlyAgreed: input.monthly,
    monthlyCap: input.monthly,
    jeonseAgreed: convertedAgreed + input.deposit,
    jeonseCap: convertedCap + input.deposit,
    amount: convertedCap + input.deposit,
  }
}
