import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import { AdSenseScript } from "@/components/adsense-script"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { MASCOT, MASCOT_FAVICON, MASCOT_SHARE } from "@/lib/brand"
import { ADSENSE_CLIENT } from "@/lib/adsense"
import { INDEX_ROBOTS } from "@/lib/seo"
import { SITE_BRAND_NAME, SITE_SEARCH_NAME, SITE_URL } from "@/lib/site"
import { THEME_BOOT_SCRIPT } from "@/lib/theme"
import "./globals.css"

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_BRAND_NAME,
  title: {
    default: SITE_SEARCH_NAME,
    template: `%s · ${SITE_SEARCH_NAME}`,
  },
  description:
    "카인드셈은 실수령액, 주휴수당, 퇴직금, 취득세, 중개수수료, 자동차세, 양도세, DSR 등 40여 가지를 법령·고시 현행본으로 계산하는 무료 계산기입니다. 표에 없는 공제는 넣지 않습니다.",
  robots: INDEX_ROBOTS,
  other: { "google-adsense-account": ADSENSE_CLIENT },
  alternates: {
    languages: { "ko-KR": "/" },
    types: { "application/rss+xml": "/rss.xml" },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: `${MASCOT_FAVICON.png48}?v=sena2`, type: "image/png", sizes: "48x48" },
      { url: `${MASCOT_FAVICON.png96}?v=sena2`, type: "image/png", sizes: "96x96" },
      { url: `${MASCOT_FAVICON.png192}?v=sena2`, type: "image/png", sizes: "192x192" },
      { url: `${MASCOT_FAVICON.png512}?v=sena2`, type: "image/png", sizes: "512x512" },
      { url: `${MASCOT_FAVICON.ico}?v=sena2`, sizes: "48x48" },
    ],
    shortcut: [{ url: `${MASCOT_FAVICON.ico}?v=sena2` }],
    apple: [{ url: "/apple-touch-icon.png?v=sena2", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: SITE_BRAND_NAME,
    title: SITE_SEARCH_NAME,
    description:
      "카인드셈은 실수령액, 주휴수당, 퇴직금, 취득세, 중개수수료, 자동차세, 양도세, DSR 등 40여 가지를 법령·고시 현행본으로 계산하는 무료 계산기입니다. 표에 없는 공제는 넣지 않습니다.",
    images: [
      {
        url: MASCOT_SHARE.src,
        width: MASCOT_SHARE.width,
        height: MASCOT_SHARE.height,
        alt: MASCOT.alt,
      },
    ],
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <meta name="naver-site-verification" content="79ca211d463e05777454b396bab507f8f9d824a9" />
        <script
          dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
          suppressHydrationWarning
        />
        <AdSenseScript />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}

