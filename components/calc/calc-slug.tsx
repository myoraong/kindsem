"use client"

import { createContext, useContext, type ReactNode } from "react"

const CalcSlugContext = createContext<string | null>(null)

export function CalcSlugProvider({ slug, children }: { slug: string; children: ReactNode }) {
  return <CalcSlugContext.Provider value={slug}>{children}</CalcSlugContext.Provider>
}

export function useCalcSlug() {
  return useContext(CalcSlugContext)
}
