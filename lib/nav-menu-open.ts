/** Header dropdowns share one open slot so two panels cannot stack. */

type Listener = () => void

const listeners = new Set<Listener>()
let openId: string | null = null
let leaveBound = false

function emit() {
  for (const listener of listeners) listener()
}

export function subscribeNavMenu(listener: Listener) {
  listeners.add(listener)
  watchPointerLeave()
  return () => {
    listeners.delete(listener)
  }
}

export function getOpenNavMenu() {
  return openId
}

export function openNavMenu(id: string) {
  if (openId === id) return
  openId = id
  emit()
}

/** 터치 화면은 첫 탭에 목록을 열고, 이미 열린 뒤의 탭이 분류로 이동합니다. */
export function coarseNavClickOpensMenu(coarsePointer: boolean, alreadyOpen: boolean) {
  return coarsePointer && !alreadyOpen
}

export function closeNavMenu(id?: string) {
  if (id && openId !== id) return
  if (openId === null) return
  openId = null
  emit()
}

function pointerLeftDocument(event: MouseEvent) {
  return event.relatedTarget === null
}

function onDocumentMouseOut(event: MouseEvent) {
  if (pointerLeftDocument(event)) closeNavMenu()
}

function watchPointerLeave() {
  if (leaveBound || typeof document === "undefined") return
  leaveBound = true
  document.addEventListener("mouseout", onDocumentMouseOut)
  window.addEventListener("blur", () => closeNavMenu())
}
