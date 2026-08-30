"use client"

import { useSyncExternalStore } from "react"
import { parseHomeSection, type HomeSection } from "@/lib/home-section"

const LOCATION_EVENT = "kindsem:location"

let patched = false

function emitLocation() {
  window.dispatchEvent(new Event(LOCATION_EVENT))
}

function patchHistory() {
  if (patched) return
  patched = true
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method].bind(history)
    history[method] = function (this: History, data: unknown, unused: string, url?: string | URL | null) {
      const result = original(data, unused, url)
      emitLocation()
      return result
    }
  }
}

function subscribe(onStoreChange: () => void) {
  patchHistory()
  window.addEventListener("hashchange", onStoreChange)
  window.addEventListener("popstate", onStoreChange)
  window.addEventListener(LOCATION_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("hashchange", onStoreChange)
    window.removeEventListener("popstate", onStoreChange)
    window.removeEventListener(LOCATION_EVENT, onStoreChange)
  }
}

export function useHomeSection(): HomeSection {
  return useSyncExternalStore(subscribe, () => parseHomeSection(window.location.hash), () => "all")
}
