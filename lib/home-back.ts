import type { LifeGroup } from "./catalog.ts"
import { HOME_SECTIONS, type HomeSection } from "./home-section.ts"

export const HOME_BACK_KEY = "kindsem-back-section"

export const HOME_BACK: Record<HomeSection, { href: string; label: string }> = {
  all: { href: "/#all", label: "전체" },
  today: { href: "/#today", label: "생활" },
  work: { href: "/#work", label: "급여" },
  realty: { href: "/#realty", label: "부동산" },
}

export function homeSectionForGroup(group: LifeGroup): HomeSection {
  if (group === "today") return "today"
  if (group === "work") return "work"
  return "realty"
}

export function parseBackSection(raw: string | null | undefined): HomeSection | null {
  if (raw === "all" || raw === "today" || raw === "work" || raw === "realty") return raw
  return null
}

type StorageLike = Pick<Storage, "getItem" | "setItem">

export function rememberBackSection(section: HomeSection, storage: StorageLike = globalThis.sessionStorage) {
  storage.setItem(HOME_BACK_KEY, section)
}

export function readBackSection(fallback: HomeSection, storage?: StorageLike): HomeSection {
  const store = storage ?? (typeof sessionStorage === "undefined" ? undefined : sessionStorage)
  if (!store) return fallback
  return parseBackSection(store.getItem(HOME_BACK_KEY)) ?? fallback
}

export function backLinkFor(section: HomeSection) {
  return HOME_BACK[section]
}

export function isHomeSection(value: string): value is HomeSection {
  return (HOME_SECTIONS as readonly string[]).includes(value)
}
