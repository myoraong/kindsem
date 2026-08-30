import Link from "next/link"
import { Sena } from "@/components/sena"
import { MASCOT } from "@/lib/brand"

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-start justify-center px-4 py-16">
      <Sena className="mb-6 w-28" />
      <p className="text-sm text-primary">Kindsem</p>
      <h1 className="mt-2 text-2xl font-semibold">이 계산은 아직 없어요</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {MASCOT.name}가 목록에 있는 계산만 세어 줄 수 있어요. 실생활에 필요한 것만 모아 두었습니다.
      </p>
      <Link href="/" className="mt-6 text-sm font-medium text-primary hover:underline">
        계산 모음으로
      </Link>
    </div>
  )
}
