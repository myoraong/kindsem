import { isHomePath, parseHomeSection, type HomeSection } from "./home-section.ts"

/** Space between the sticky stack (site header + chips) and the section title. */
export const HOME_SECTION_SNAP_GAP_PX = 12

/**
 * Native hash fallback class (header + chip bar + 12px).
 * JS snap uses measured heights so wrapped chips still line up.
 */
export const HOME_SECTION_SCROLL_MARGIN_CLASS = "home-section-snap"

const HEADER_FALLBACK_PX = 60
const CHIPS_FALLBACK_PX = 64

export function homeSectionSnapTargetId(section: HomeSection): string {
  return section === "all" ? "today" : section
}

export function homeSectionStickyOffset(
  headerHeight: number,
  chipsHeight: number,
  gap = HOME_SECTION_SNAP_GAP_PX,
): number {
  return headerHeight + chipsHeight + gap
}

export function homeSectionSnapScrollY(viewportTop: number, scrollY: number, stickyOffset: number): number {
  return Math.max(0, Math.round(scrollY + viewportTop - stickyOffset))
}

export function homeSectionFromHref(href: string): HomeSection | null {
  if (!href.startsWith("/#") && !href.startsWith("#")) return null
  const id = href.replace(/^\/?#/, "")
  if (id === "all" || id === "today" || id === "work" || id === "realty") return id
  return null
}

export function isExplicitHomeSectionHash(hash: string): boolean {
  return homeSectionFromHref(hash) !== null
}

function measureStickyOffset(): number {
  const header = document.querySelector<HTMLElement>("[data-site-header]")
  const chips = document.querySelector<HTMLElement>("[data-home-jump]")
  return homeSectionStickyOffset(
    header?.getBoundingClientRect().height ?? HEADER_FALLBACK_PX,
    chips?.getBoundingClientRect().height ?? CHIPS_FALLBACK_PX,
  )
}

export function snapHomeSection(section: HomeSection): void {
  const target = document.getElementById(homeSectionSnapTargetId(section))
  if (!target) return
  const top = homeSectionSnapScrollY(target.getBoundingClientRect().top, window.scrollY, measureStickyOffset())
  window.scrollTo({ top, behavior: "auto" })
}

export function goHomeSection(section: HomeSection): void {
  const next = `#${section}`
  if (window.location.hash === next) {
    snapHomeSection(section)
    return
  }
  window.location.hash = section
}

export function interceptHomeSectionClick(href: string, event: { preventDefault: () => void }): boolean {
  const section = homeSectionFromHref(href)
  if (!section || !isHomePath(window.location.pathname)) return false
  event.preventDefault()
  goHomeSection(section)
  return true
}

export function homeSectionToSnap(hash: string): HomeSection | null {
  if (!isExplicitHomeSectionHash(hash)) return null
  return parseHomeSection(hash)
}
