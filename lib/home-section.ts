export const HOME_SECTIONS = ["all", "today", "work", "realty"] as const

export type HomeSection = (typeof HOME_SECTIONS)[number]

export function parseHomeSection(hash: string): HomeSection {
  const id = hash.startsWith("#") ? hash.slice(1) : hash
  if (id === "all" || id === "today" || id === "work" || id === "realty") return id
  return "all"
}

export function isHomePath(pathname: string) {
  return pathname === "/" || pathname === ""
}
