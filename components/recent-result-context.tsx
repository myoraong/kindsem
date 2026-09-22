"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { readRecentCalcs, readRecentResults } from "@/lib/recent-calcs"

type RecentSnapshot = {
  slugs: string[]
  results: Record<string, string>
  refresh: () => void
}

const RecentResultContext = createContext<RecentSnapshot>({
  slugs: [],
  results: {},
  refresh: () => {},
})

/** 페이지를 옮길 때마다 마지막 결과를 다시 읽습니다. 레이아웃은 유지되기 때문입니다. */
export function RecentResultProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [slugs, setSlugs] = useState<string[]>([])
  const [results, setResults] = useState<Record<string, string>>({})

  const refresh = useCallback(() => {
    const storage = window.localStorage
    setSlugs(readRecentCalcs(storage))
    setResults(readRecentResults(storage))
  }, [])

  useEffect(() => {
    refresh()
  }, [pathname, refresh])

  return (
    <RecentResultContext.Provider value={{ slugs, results, refresh }}>
      {children}
    </RecentResultContext.Provider>
  )
}

export function useRecentSnapshot() {
  return useContext(RecentResultContext)
}

export function useRecentResult(slug: string) {
  return useRecentSnapshot().results[slug] ?? ""
}
