import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import { AdSenseScript } from "@/components/adsense-script"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { MASCOT } from "@/lib/brand"
import { ADSENSE_CLIENT } from "@/lib/adsense"
import { SITE_NAME, SITE_URL } from "@/lib/site"
import { THEME_BOOT_SCRIPT } from "@/lib/theme"
import "./globals.css"

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `생활·급여·부동산 계산기 · ${SITE_NAME}`,
    template: "%s · Kindsem 카인드셈",
  },
  description:
    "실수령액, 주휴수당, 퇴직금, 취득세, 중개수수료, 자동차세, 양도세, DSR 계산기. 법령·고시 기준.",
  robots: { index: true, follow: true },
  other: { "google-adsense-account": ADSENSE_CLIENT },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/kindsem-sena-icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/kindsem-sena-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: SITE_NAME,
    images: [
      {
        url: "/kindsem-sena-icon.png",
        width: 512,
        height: 512,
        alt: MASCOT.alt,
      },
    ],
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
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

