"use client"

import { useCallback, useLayoutEffect, useRef, useState } from "react"
import {
  calcStateEquals,
  decodeCalcQuery,
  encodeCalcQuery,
  mergeCalcState,
  readCalcStorage,
  sanitizePersistedValues,
  writeCalcStorage,
  type CalcPersistValue,
} from "./calc-persist.ts"

function replaceSearch(query: string) {
  const url = new URL(window.location.href)
  const next = `${url.pathname}${query}${url.hash}`
  const current = `${url.pathname}${url.search}${url.hash}`
  if (next !== current) window.history.replaceState(window.history.state, "", next)
}

export const CALC_RESET_EVENT = "kindsem-calc-reset"

export function requestCalcReset(slug: string) {
  window.dispatchEvent(new CustomEvent(CALC_RESET_EVENT, { detail: slug }))
}

type WidenBool<T> = {
  [K in keyof T]: T[K] extends boolean ? boolean : T[K]
}

export function useCalcPersist<T extends Record<string, CalcPersistValue>>(slug: string, defaults: T) {
  const [values, setValues] = useState<WidenBool<T>>(defaults as WidenBool<T>)
  const defaultsRef = useRef(defaults)
  defaultsRef.current = defaults

  useLayoutEffect(() => {
    function onReset(event: Event) {
      if (!(event instanceof CustomEvent) || event.detail !== slug) return
      const defaults = defaultsRef.current
      setValues(defaults as WidenBool<T>)
      writeCalcStorage(slug, defaults)
      replaceSearch("")
    }
    window.addEventListener(CALC_RESET_EVENT, onReset)
    return () => window.removeEventListener(CALC_RESET_EVENT, onReset)
  }, [slug])

  useLayoutEffect(() => {
    const stored = readCalcStorage<T>(slug)
    const hadQuery = window.location.search.length > 1
    const query = decodeCalcQuery(window.location.search, defaultsRef.current)
    const merged = sanitizePersistedValues(
      slug,
      mergeCalcState(defaultsRef.current, stored, query),
    ) as WidenBool<T>
    setValues(merged)
    writeCalcStorage(slug, merged)
    if (hadQuery || !calcStateEquals(merged, defaultsRef.current as WidenBool<T>)) {
      replaceSearch(encodeCalcQuery(merged))
    }
  }, [slug])

  const set = useCallback(<K extends keyof WidenBool<T>>(key: K, value: WidenBool<T>[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value }
      writeCalcStorage(slug, next)
      replaceSearch(encodeCalcQuery(next))
      return next
    })
  }, [slug])

  const setMany = useCallback((partial: Partial<WidenBool<T>>) => {
    setValues((prev) => {
      const next = { ...prev, ...partial }
      writeCalcStorage(slug, next)
      replaceSearch(encodeCalcQuery(next))
      return next
    })
  }, [slug])

  return [values, set, setMany] as const
}
