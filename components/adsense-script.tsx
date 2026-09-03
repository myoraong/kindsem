import { adsenseScriptSrc, resolveAdsenseClientId } from "@/lib/adsense"

export function AdSenseScript() {
  const src = adsenseScriptSrc(resolveAdsenseClientId())
  if (!src) return null
  return <script async src={src} crossOrigin="anonymous" suppressHydrationWarning />
}
