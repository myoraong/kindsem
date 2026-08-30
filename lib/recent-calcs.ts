export const RECENT_CALCS_KEY = "kindsem-recent-calcs"
export const RECENT_CALCS_MAX = 5

export function rememberRecentCalc(slug: string, storage: Pick<Storage, "getItem" | "setItem"> | null) {
  if (!storage || !slug) return
  const next = [slug, ...readRecentCalcs(storage).filter((item) => item !== slug)].slice(
    0,
    RECENT_CALCS_MAX,
  )
  storage.setItem(RECENT_CALCS_KEY, JSON.stringify(next))
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
