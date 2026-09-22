export function textInputsIn(root: ParentNode) {
  return [...root.querySelectorAll("input")].filter(
    (el): el is HTMLInputElement =>
      el instanceof HTMLInputElement && el.type !== "checkbox" && el.type !== "radio" && !el.disabled,
  )
}

export function hasNextTextInput(current: HTMLInputElement) {
  const root = current.closest("section")
  if (!root) return false
  const fields = textInputsIn(root)
  return fields.indexOf(current) >= 0 && fields.indexOf(current) < fields.length - 1
}

/** 다음 칸이 있으면 거기로, 마지막이면 결과로 옮깁니다. */
export function focusNextOrResult(current: HTMLInputElement) {
  const root = current.closest("section")
  const fields = root ? textInputsIn(root) : []
  const next = fields[fields.indexOf(current) + 1]
  if (next) {
    next.focus()
    return
  }
  current.blur()
  document.getElementById("calc-result")?.scrollIntoView({ behavior: "smooth", block: "start" })
}
