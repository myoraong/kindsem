"use client"

import type { ReactNode } from "react"

export function CheckRow({
  id,
  checked,
  onChange,
  children,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 shrink-0 rounded-[4px] border border-input accent-primary"
      />
      <span>{children}</span>
    </label>
  )
}
