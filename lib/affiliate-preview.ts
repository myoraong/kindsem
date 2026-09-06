/** 로컬 `next dev`에서만 제휴 칸을 보여 줍니다. 라이브 빌드에는 안 나갑니다. */
export const AFFILIATE_PREVIEW_SLUGS = ["sale-vat"] as const

export const COUPANG_AFFILIATE_HREF = "https://link.coupang.com/a/gN2PLcmqjY"

/** 쿠팡 파트너스 활동 시 주의 사항 문장. 지마켓 문장과 바꿔 쓰지 않습니다. */
export const COUPANG_AFFILIATE_DISCLOSURE =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다."

export function isAffiliatePreviewEnabled(
  nodeEnv = process.env.NODE_ENV,
) {
  return nodeEnv === "development"
}

export function showsAffiliatePreview(
  slug: string,
  nodeEnv = process.env.NODE_ENV,
) {
  return (
    isAffiliatePreviewEnabled(nodeEnv) &&
    (AFFILIATE_PREVIEW_SLUGS as readonly string[]).includes(slug)
  )
}
