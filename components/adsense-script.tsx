import { adsenseClientIdFromEnv, adsenseScriptSrc } from "@/lib/adsense"

export function AdSenseScript() {
  const src = adsenseScriptSrc(adsenseClientIdFromEnv())
  if (!src) return null
  return <script async src={src} crossOrigin="anonymous" />
}
