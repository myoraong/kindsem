import assert from "node:assert/strict"
import test from "node:test"
import {
  ADS_TXT_COMMENT,
  ADSENSE_ADS_TXT_CERT,
  adsenseClientIdFromEnv,
  adsenseScriptSrc,
  existingAdsTxtPublisherId,
  parseAdsensePublisherId,
  renderAdsTxt,
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
