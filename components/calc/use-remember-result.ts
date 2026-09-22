"use client"

import { useEffect } from "react"
import { useCalcSlug } from "@/components/calc/calc-slug"
import { clearRecentResult, rememberRecentResult } from "@/lib/recent-calcs"

/** 계산기 화면에 나온 큰 숫자를 최근 목록에 남겨, 홈에서 다시 고를 때 금액이 보이게 합니다. */
export function useRememberRecentResult(display: string) {
  const slug = useCalcSlug()

  useEffect(() => {
    if (!slug) return
    const text = display.trim()
    if (!text) {
      clearRecentResult(slug, window.localStorage)
      return
    }
    rememberRecentResult(slug, text, window.localStorage)
  }, [slug, display])
}
