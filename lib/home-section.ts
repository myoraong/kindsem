export const HOME_SECTIONS = ["today", "work", "realty"] as const

export type HomeSection = (typeof HOME_SECTIONS)[number]

export function parseHomeSection(hash: string): HomeSection {
  const id = hash.startsWith("#") ? hash.slice(1) : hash
  if (id === "work" || id === "realty" || id === "today") return id
  return "today"
}

export function isHomePath(pathname: string) {
  return pathname === "/" || pathname === ""
}
