export type CalcPersistValue = string | boolean

const STORAGE_PREFIX = "kindsem-calc:"

export function encodeCalcQuery(values: Record<string, CalcPersistValue>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    params.set(key, typeof value === "boolean" ? (value ? "1" : "0") : value)
  }
  const encoded = params.toString()
  return encoded ? `?${encoded}` : ""
}

export function decodeCalcQuery<T extends Record<string, CalcPersistValue>>(
  search: string,
  defaults: T,
): Partial<T> {
  const query = search.startsWith("?") ? search.slice(1) : search
  if (!query) return {}
  const params = new URLSearchParams(query)
  const next: Partial<T> = {}
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    if (!params.has(String(key))) continue
    const raw = params.get(String(key)) ?? ""
    const fallback = defaults[key]
    next[key] = (
      typeof fallback === "boolean" ? raw === "1" || raw === "true" : raw
    ) as T[keyof T]
  }
  return next
}

export function mergeCalcState<T extends Record<string, CalcPersistValue>>(
  defaults: T,
  stored: Partial<T> | null | undefined,
  query: Partial<T>,
): T {
  const next = { ...defaults }
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    if (stored && Object.prototype.hasOwnProperty.call(stored, key) && stored[key] !== undefined) {
      next[key] = stored[key] as T[keyof T]
    }
    if (Object.prototype.hasOwnProperty.call(query, key) && query[key] !== undefined) {
      next[key] = query[key] as T[keyof T]
    }
  }
  return next
}

/** 예전에 넣어 둔 0은 없는 것과 같다. 빈 칸으로 되돌린다. */
const BLANK_ZERO: Record<string, string[]> = {
  "offer-compare": ["commute", "years"],
  moving: ["loan"],
  dutch: ["tip"],
  "annual-leave": ["unused"],
  "rent-credit": ["globalIncome"],
}

export function sanitizePersistedValues<T extends Record<string, CalcPersistValue>>(
  slug: string,
  values: T,
): T {
  const keys = BLANK_ZERO[slug]
  if (!keys) return values
  let next: T | null = null
  for (const key of keys) {
    if (key in values && values[key] === "0") {
      if (!next) next = { ...values }
      ;(next as Record<string, CalcPersistValue>)[key] = ""
    }
  }
  return next ?? values
}

export function calcStateEquals<T extends Record<string, CalcPersistValue>>(left: T, right: T) {
  const keys = Object.keys(left)
  if (keys.length !== Object.keys(right).length) return false
  return keys.every((key) => left[key] === right[key])
}

export function storageKeyForCalc(slug: string) {
  return `${STORAGE_PREFIX}${slug}`
}

export function readCalcStorage<T extends Record<string, CalcPersistValue>>(
  slug: string,
  storage: Pick<Storage, "getItem"> | null = typeof localStorage === "undefined" ? null : localStorage,
): Partial<T> | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(storageKeyForCalc(slug))
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null
    return parsed as Partial<T>
  } catch {
    return null
  }
}

export function writeCalcStorage(
  slug: string,
  values: Record<string, CalcPersistValue>,
  storage: Pick<Storage, "setItem"> | null = typeof localStorage === "undefined" ? null : localStorage,
) {
  if (!storage) return
  storage.setItem(storageKeyForCalc(slug), JSON.stringify(values))
}
