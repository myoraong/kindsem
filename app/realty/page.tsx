import { RealtyCatalog } from "@/components/realty-catalog"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "부동산 계산기",
  description: "양도세, 증여세, 취득세, LTV 등 부동산 세금과 대출을 한곳에서.",
}

export default function RealtyPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <p className="text-sm font-medium text-primary">부동산</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl">
        살 때·빌릴 때 세금까지.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
        세율·공제 한도는 현행 법령입니다. 빠진 공제·사실관계가 있으면 신고 세액이 달라집니다. 신고는
        세무사와 확인하세요.
      </p>
      <div className="mt-8">
        <RealtyCatalog />
      </div>
    </div>
  )
}
