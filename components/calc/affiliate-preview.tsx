"use client"

import {
  COUPANG_AFFILIATE_DISCLOSURE,
  COUPANG_AFFILIATE_HREF,
  showsAffiliatePreview,
} from "@/lib/affiliate-preview"

export function AffiliatePreview({ slug }: { slug: string }) {
  if (!showsAffiliatePreview(slug)) return null

  return (
    <aside aria-label="제휴 광고 미리보기" className="mt-6">
      <a
        href={COUPANG_AFFILIATE_HREF}
        rel="sponsored nofollow noopener noreferrer"
        target="_blank"
        className="block overflow-hidden rounded-2xl bg-white px-5 pb-2.5 pt-5 ring-1 ring-foreground/10 transition hover:ring-foreground/20 sm:pt-6"
      >
        <span className="flex items-center justify-center pb-5 sm:pb-6">
          <img
            src="/affiliate-preview/coupang.svg"
            alt=""
            width={180}
            height={40}
            className="h-8 w-auto sm:h-9"
          />
          <span className="sr-only">쿠팡에서 보기</span>
        </span>
        <span className="block text-center text-[10px] font-normal leading-4 text-neutral-400">
          제휴 광고 · {COUPANG_AFFILIATE_DISCLOSURE}
        </span>
      </a>
      <p className="mt-0.5 text-center text-[8px] leading-tight text-muted-foreground/70">
        로컬 미리보기입니다. 라이브에는 없습니다.
      </p>
    </aside>
  )
}
