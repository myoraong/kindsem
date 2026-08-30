import { RealtyCatalog } from "@/components/realty-catalog"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "부동산 계산기",
  description:
    "취득세, 양도세, 증여세, 중개수수료, 전월세 전환율, LTV, DSR 계산기. 법령·고시 기준.",
  alternates: { canonical: "/realty/" },
}

export default function RealtyPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <p className="text-sm font-medium text-primary">부동산</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-3xl">
        부동산 계산기
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
