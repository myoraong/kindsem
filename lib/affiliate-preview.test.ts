import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"
import {
  AFFILIATE_PREVIEW_SLUGS,
  COUPANG_AFFILIATE_DISCLOSURE,
  COUPANG_AFFILIATE_HREF,
  isAffiliatePreviewEnabled,
  showsAffiliatePreview,
} from "./affiliate-preview.ts"

test("제휴 미리보기는 development에서만 켠다", () => {
  assert.equal(isAffiliatePreviewEnabled("development"), true)
  assert.equal(isAffiliatePreviewEnabled("production"), false)
  assert.equal(isAffiliatePreviewEnabled("test"), false)
})

test("할인·부가세만 제휴 미리보기 대상이다", () => {
  assert.deepEqual([...AFFILIATE_PREVIEW_SLUGS], ["sale-vat"])
  assert.equal(showsAffiliatePreview("sale-vat", "development"), true)
  assert.equal(showsAffiliatePreview("take-home", "development"), false)
  assert.equal(showsAffiliatePreview("sale-vat", "production"), false)
})

test("쿠팡 파트너스 추적 링크 형식이 맞다", () => {
  assert.equal(COUPANG_AFFILIATE_HREF, "https://link.coupang.com/a/gN2PLcmqjY")
  assert.match(COUPANG_AFFILIATE_HREF, /^https:\/\/link\.coupang\.com\/a\/[A-Za-z0-9]+$/)
})

test("화면에 링크프라이스·지마켓 실적 안내를 넣지 않는다", () => {
  const body = readFileSync(join(process.cwd(), "components/calc/affiliate-preview.tsx"), "utf8")
  assert.doesNotMatch(body, /링크프라이스/)
  assert.doesNotMatch(body, /gmarket/i)
  assert.doesNotMatch(body, /지마켓/)
  assert.match(body, /affiliate-preview\/coupang\.svg/)
  assert.match(body, /COUPANG_AFFILIATE_DISCLOSURE/)
  assert.match(body, /제휴 광고 ·/)
  assert.match(body, /text-\[10px\]/)
  const disclosureAt = body.indexOf("제휴 광고 ·")
  const closeAnchorAt = body.indexOf("</a>")
  assert.ok(disclosureAt !== -1 && disclosureAt < closeAnchorAt)
})

test("쿠팡 대가성 문구는 파트너스 주의 사항 문장이다", () => {
  assert.equal(
    COUPANG_AFFILIATE_DISCLOSURE,
    "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.",
  )
  assert.doesNotMatch(COUPANG_AFFILIATE_DISCLOSURE, /제휴마케팅이 포함된 광고/)
})
