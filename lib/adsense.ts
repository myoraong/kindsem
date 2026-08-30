/** Google ads.txt certification authority ID for AdSense. */
export const ADSENSE_ADS_TXT_CERT = "f08c47fec0942fa0"

/** 애드센스가 준 게시자 번호. 헤드 확인용 스크립트에 씁니다. */
export const ADSENSE_CLIENT = "ca-pub-1559116385038077"

const PUB_ID_RE = /pub-\d+/

export function parseAdsensePublisherId(value: string | undefined | null): string | null {
  if (!value) return null
  const match = value.trim().match(PUB_ID_RE)
  return match ? match[0] : null
}

export function adsensePublisherIdFromEnv(
  pub = process.env.NEXT_PUBLIC_ADSENSE_PUB,
  client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
): string | null {
  return parseAdsensePublisherId(pub) ?? parseAdsensePublisherId(client)
}

/** Head snippet uses ca-pub-…. Only when NEXT_PUBLIC_ADSENSE_CLIENT is set. */
export function adsenseClientIdFromEnv(
  client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
): string | null {
  const pub = parseAdsensePublisherId(client)
  return pub ? `ca-${pub}` : null
}

export function adsenseScriptSrc(clientId: string | null): string | null {
  if (!clientId) return null
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`
}

export function existingAdsTxtPublisherId(text: string): string | null {
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const match = trimmed.match(
      /^google\.com,\s*(pub-\d+)\s*,\s*DIRECT\s*,\s*f08c47fec0942fa0$/i,
    )
    if (match) return match[1]
  }
  return null
}

export const ADS_TXT_COMMENT = `# Kindsem ads.txt
# Google AdSense 승인 후 받은 게시자 ID로 아래 한 줄을 채웁니다.
# 형식: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
#
# .env.local 에 NEXT_PUBLIC_ADSENSE_PUB 또는 NEXT_PUBLIC_ADSENSE_CLIENT 를 넣고
# 다시 빌드하면 이 파일이 채워집니다. 가짜 pub- 값은 넣지 마세요.
`

export function renderAdsTxt(input: {
  envPub?: string | null
  envClient?: string | null
  existing?: string | null
}): string {
  const pub =
    parseAdsensePublisherId(input.envPub) ??
    parseAdsensePublisherId(input.envClient) ??
    existingAdsTxtPublisherId(input.existing ?? "")
  if (!pub) return ADS_TXT_COMMENT
  return `${ADS_TXT_COMMENT}google.com, ${pub}, DIRECT, ${ADSENSE_ADS_TXT_CERT}\n`
}
