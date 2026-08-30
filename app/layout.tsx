import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SITE_URL } from "@/lib/site"
import { THEME_BOOT_SCRIPT } from "@/lib/theme"
import "./globals.css"

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kindsem 카인드셈 — 친절한 생활 계산",
    template: "%s · Kindsem",
  },
  description:
    "Kindsem(카인드셈)은 밥값 나누기부터 중개수수료, 취득세, 대출 월납입까지 실생활에 필요한 계산만 친절하게 보여 줍니다.",
  alternates: { canonical: "/" },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
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

