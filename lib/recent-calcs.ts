export const RECENT_CALCS_KEY = "kindsem-recent-calcs"
export const RECENT_RESULTS_KEY = "kindsem-recent-results"
export const RECENT_CALCS_MAX = 5
const RECENT_RESULT_MAX = 48

type ResultStorage = Pick<Storage, "getItem" | "setItem">

export function rememberRecentCalc(slug: string, storage: ResultStorage | null) {
  if (!storage || !slug) return
  const next = [slug, ...readRecentCalcs(storage).filter((item) => item !== slug)].slice(
    0,
    RECENT_CALCS_MAX,
  )
  storage.setItem(RECENT_CALCS_KEY, JSON.stringify(next))
  pruneRecentResults(next, storage)
}

export function forgetRecentCalc(slug: string, storage: ResultStorage | null) {
  if (!storage || !slug) return
  const next = readRecentCalcs(storage).filter((item) => item !== slug)
  storage.setItem(RECENT_CALCS_KEY, JSON.stringify(next))
  clearRecentResult(slug, storage)
}

export function rememberRecentResult(slug: string, display: string, storage: ResultStorage | null) {
  if (!storage || !slug) return
  const text = display.trim().slice(0, RECENT_RESULT_MAX)
  if (!text) {
    clearRecentResult(slug, storage)
    return
  }
  const map = readRecentResults(storage)
  if (map[slug] === text) return
  map[slug] = text
  storage.setItem(RECENT_RESULTS_KEY, JSON.stringify(map))
}

export function clearRecentResult(slug: string, storage: ResultStorage | null) {
  if (!storage || !slug) return
  const map = readRecentResults(storage)
  if (!(slug in map)) return
  delete map[slug]
  storage.setItem(RECENT_RESULTS_KEY, JSON.stringify(map))
}

export function readRecentResults(storage: Pick<Storage, "getItem"> | null): Record<string, string> {
  if (!storage) return {}
  try {
    const raw = storage.getItem(RECENT_RESULTS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}
    const out: Record<string, string> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof key !== "string" || !key) continue
      if (typeof value !== "string") continue
      const text = value.trim().slice(0, RECENT_RESULT_MAX)
      if (text) out[key] = text
    }
    return out
  } catch {
    return {}
  }
}

function pruneRecentResults(slugs: string[], storage: ResultStorage) {
  const map = readRecentResults(storage)
  const keep: Record<string, string> = {}
  for (const slug of slugs) {
    const text = map[slug]
    if (text) keep[slug] = text
  }
  const before = Object.keys(map)
  const after = Object.keys(keep)
  if (before.length === after.length && before.every((slug) => keep[slug] === map[slug])) return
  storage.setItem(RECENT_RESULTS_KEY, JSON.stringify(keep))
}

export function readRecentCalcs(storage: Pick<Storage, "getItem"> | null): string[] {
  if (!storage) return []
  try {
    const raw = storage.getItem(RECENT_CALCS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0)
  } catch {
    return []
  }
}
