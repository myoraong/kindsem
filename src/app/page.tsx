import Link from "next/link";

import { Calculator } from "@/components/calculator";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-[#faf7f2] text-stone-900">
      <SiteHeader current="home" />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 max-w-xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase">
            DeskCalc
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            바로 쓰는 계산기
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600 sm:text-base">
            사칙연산, 메모리, 계산 기록을 지원합니다. 키보드로도 입력할 수
            있습니다.             내 주소로 열고 싶다면{" "}
            <Link
              href="/guide/"
              className="font-medium text-stone-900 underline underline-offset-4"
            >
              Cloudflare에서 도메인 사는 법
            </Link>
            을 보세요.
          </p>
        </div>
        <Calculator />
        <p className="mt-6 text-xs text-stone-500">
          숫자와 <span className="font-mono">+ − × ÷</span>, Enter, Esc,
          Backspace를 사용할 수 있습니다.
        </p>
      </main>
    </div>
  );
}
