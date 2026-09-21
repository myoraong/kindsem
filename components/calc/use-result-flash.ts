"use client"

import { useEffect, useRef, useState } from "react"

/** 첫 표시 이후 결과 숫자가 바뀔 때만 짧게 강조합니다. */
export function useResultFlash(value: string) {
  const [flash, setFlash] = useState(false)
  const seen = useRef(false)
  const prev = useRef(value)

  useEffect(() => {
    if (!seen.current) {
      seen.current = true
      prev.current = value
      return
    }
    if (prev.current === value) return
    prev.current = value
    setFlash(true)
    const id = window.setTimeout(() => setFlash(false), 700)
    return () => window.clearTimeout(id)
  }, [value])

  return flash
}
