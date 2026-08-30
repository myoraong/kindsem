import Link from "next/link"
import { Sena } from "@/components/sena"

export function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <Sena variant="face" className="size-9" priority />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className="text-[16px] font-semibold tracking-tight">Kindsem</span>
        <span className="mt-1 hidden text-[11px] font-medium tracking-wide text-muted-foreground sm:block">
          친절한 생활 계산
        </span>
      </span>
    </span>
  )
}

export function BrandLink() {
  return (
    <Link
      href="/"
      className="rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <BrandMark />
    </Link>
  )
}
