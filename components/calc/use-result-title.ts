"use client"

import { useEffect } from "react"
import { resultTabTitle } from "@/lib/result-title"

/** 다른 앱으로 나갔을 때도 방금 결과가 탭에 남게 합니다. */
export function useResultTitle(amount: string, name: string) {
  useEffect(() => {
    if (!amount.trim()) return
    const previous = document.title
    document.title = resultTabTitle(amount, name)
    return () => {
      document.title = previous
    }
  }, [amount, name])
}
