"use client"

import { useEffect, useState } from "react"
import { POLICY_FETCHED_AT, POLICY_SOURCES } from "@/lib/policy.generated"

const WATCH = [
  { query: "소득세법", enforced: POLICY_SOURCES.income.enforced },
  { query: "법인세법", enforced: POLICY_SOURCES.corp.enforced },
  { query: "상속세 및 증여세법", enforced: POLICY_SOURCES.gift.enforced },
  { query: "지방세법", enforced: POLICY_SOURCES.local.enforced },
  { query: "부가가치세법", enforced: POLICY_SOURCES.vat.enforced },
  { query: "공인중개사법 시행규칙", enforced: POLICY_SOURCES.brokerage.enforced },
] as const

function ymd(raw: string) {
  if (raw.length === 8) return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
  return ""
}

export function PolicyStamp() {
  const [changed, setChanged] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    Promise.all(
      WATCH.map(async (item) => {
        const url =
          "https://www.law.go.kr/DRF/lawSearch.do?OC=test&target=law&type=JSON&query=" +
          encodeURIComponent(item.query)
        const res = await fetch(url)
        if (!res.ok) return null
        const data = await res.json()
        const laws = data?.LawSearch?.law
        const list = Array.isArray(laws) ? laws : laws ? [laws] : []
        const row = list.find((entry: { 법령명한글?: string }) => entry.법령명한글 === item.query)
        const live = ymd(String(row?.시행일자 || ""))
        if (live && live !== item.enforced) return `${item.query} ${live}`
        return null
      }),
    )
      .then((rows) => {
        if (!cancelled) setChanged(rows.filter((row): row is string => Boolean(row)))
      })
      .catch(() => {
        if (!cancelled) setChanged([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <p className="mt-8 text-xs leading-5 text-muted-foreground">
      세율·중개보수·인지세·부가세·LTV·DSR은 {POLICY_FETCHED_AT} 법령 현행본 기준입니다.
      {changed.length ? (
        <span className="mt-1 block text-primary">
          {changed.join(" · ")} 시행일이 바뀌었습니다.
        </span>
      ) : null}
    </p>
  )
}
