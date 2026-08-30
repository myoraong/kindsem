import { ADSENSE_CLIENT, adsenseClientIdFromEnv, adsenseScriptSrc } from "@/lib/adsense"

export function AdSenseScript() {
  const src = adsenseScriptSrc(adsenseClientIdFromEnv() ?? adsenseClientIdFromEnv(ADSENSE_CLIENT))
  if (!src) return null
  return <script async src={src} crossOrigin="anonymous" />
}
