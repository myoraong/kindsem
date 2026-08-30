export const HOME_SECTIONS = ["all", "today", "work", "realty"] as const

export type HomeSection = (typeof HOME_SECTIONS)[number]

/** Active chip: tea-sage mint (`--accent`). Dark text stays readable. */
export const HOME_CHIP_ACTIVE = "bg-accent font-medium text-foreground ring-transparent"

/** Inactive chips: white/cream only — no sage fill. */
export const HOME_CHIP_INACTIVE = "bg-card ring-foreground/12 hover:bg-muted/80"

export function homeChipClass(id: HomeSection, section: HomeSection) {
  return id === section ? HOME_CHIP_ACTIVE : HOME_CHIP_INACTIVE
}

export function parseHomeSection(hash: string): HomeSection {
  const id = hash.startsWith("#") ? hash.slice(1) : hash
  if (id === "all" || id === "today" || id === "work" || id === "realty") return id
  return "all"
}

export function isHomePath(pathname: string) {
  return pathname === "/" || pathname === ""
}
