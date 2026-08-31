import assert from "node:assert/strict"
import test from "node:test"
import {
  ADS_TXT_COMMENT,
  ADSENSE_ADS_TXT_CERT,
  ADSENSE_CLIENT,
  adsenseClientIdFromEnv,
  adsenseScriptSrc,
  existingAdsTxtPublisherId,
  parseAdsensePublisherId,
  renderAdsTxt,
  resolveAdsenseClientId,
  shouldRenderAdOnPath,
  adFillFromStatus,
  adSlotShowsChrome,
} from "./adsense.ts"

test("게시자 ID는 pub- 숫자만 뽑고 가짜 값은 만들지 않는다", () => {
  assert.equal(parseAdsensePublisherId("pub-1234567890123456"), "pub-1234567890123456")
  assert.equal(parseAdsensePublisherId("ca-pub-1234567890123456"), "pub-1234567890123456")
  assert.equal(parseAdsensePublisherId("  ca-pub-999  "), "pub-999")
  assert.equal(parseAdsensePublisherId(""), null)
  assert.equal(parseAdsensePublisherId("undefined"), null)
  assert.equal(parseAdsensePublisherId("pub-XXXXXXXXXXXXXXXX"), null)
})

test("광고 스크립트 client는 NEXT_PUBLIC_ADSENSE_CLIENT가 있을 때만 만든다", () => {
  assert.equal(adsenseClientIdFromEnv(""), null)
  assert.equal(adsenseClientIdFromEnv(undefined), null)
  assert.equal(adsenseClientIdFromEnv("ca-pub-1234567890123456"), "ca-pub-1234567890123456")
  assert.equal(adsenseClientIdFromEnv("pub-1234567890123456"), "ca-pub-1234567890123456")
  assert.equal(
    adsenseScriptSrc("ca-pub-1234567890123456"),
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456",
  )
  assert.equal(adsenseScriptSrc(null), null)
  assert.equal(resolveAdsenseClientId(""), ADSENSE_CLIENT)
  assert.equal(resolveAdsenseClientId(undefined), ADSENSE_CLIENT)
  assert.equal(resolveAdsenseClientId("ca-pub-1234567890123456"), "ca-pub-1234567890123456")
})

test("인페이지 광고는 채워지기 전에는 상자를 그리지 않는다", () => {
  assert.equal(adFillFromStatus(null), "pending")
  assert.equal(adFillFromStatus(""), "pending")
  assert.equal(adFillFromStatus("filled"), "filled")
  assert.equal(adFillFromStatus("unfilled"), "unfilled")
  assert.equal(adSlotShowsChrome("pending"), false)
  assert.equal(adSlotShowsChrome("unfilled"), false)
  assert.equal(adSlotShowsChrome("filled"), true)
})

test("인페이지 광고는 개인정보·문의 경로에는 넣지 않는다", () => {
  assert.equal(shouldRenderAdOnPath("/"), true)
  assert.equal(shouldRenderAdOnPath("/calc/take-home"), true)
  assert.equal(shouldRenderAdOnPath("/calc/take-home/"), true)
  assert.equal(shouldRenderAdOnPath("/calc/severance"), true)
  assert.equal(shouldRenderAdOnPath("/calc/severance/"), true)
  assert.equal(shouldRenderAdOnPath("/realty"), true)
  assert.equal(shouldRenderAdOnPath("/privacy"), false)
  assert.equal(shouldRenderAdOnPath("/privacy/"), false)
  assert.equal(shouldRenderAdOnPath("/contact"), false)
  assert.equal(shouldRenderAdOnPath("/contact/"), false)
})

test("ads.txt는 env가 없으면 주석만 넣고 google.com 줄을 넣지 않는다", () => {
  const text = renderAdsTxt({ envPub: "", envClient: "", existing: "" })
  assert.equal(text, ADS_TXT_COMMENT)
  assert.doesNotMatch(text, /^google\.com,/m)
  assert.match(text, /가짜 pub- 값은 넣지 마세요/)
})

test("ads.txt는 PUB 또는 CLIENT env로 google.com 한 줄을 채운다", () => {
  const fromPub = renderAdsTxt({ envPub: "pub-1234567890123456", envClient: "" })
  assert.match(fromPub, /^google\.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0$/m)
  assert.equal(fromPub.endsWith(`${ADSENSE_ADS_TXT_CERT}\n`), true)

  const fromClient = renderAdsTxt({
    envPub: "",
    envClient: "ca-pub-1234567890123456",
  })
  assert.match(fromClient, /^google\.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0$/m)
})

test("ads.txt는 env가 비어도 이미 있는 google.com 줄을 지치지 않는다", () => {
  const existing = `${ADS_TXT_COMMENT}google.com, pub-1111222233334444, DIRECT, f08c47fec0942fa0\n`
  assert.equal(existingAdsTxtPublisherId(existing), "pub-1111222233334444")
  const text = renderAdsTxt({ envPub: "", envClient: "", existing })
  assert.match(text, /^google\.com, pub-1111222233334444, DIRECT, f08c47fec0942fa0$/m)
})
