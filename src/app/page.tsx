import Link from "next/link";

import { Calculator } from "@/components/calculator";
import { SiteShell } from "@/components/site-shell";
import { buttonVariants } from "@/components/ui/button";
import { isDomainLocked, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const locked = isDomainLocked();

  return (
    <SiteShell current="home">
      <div className="mb-8 flex max-w-xl flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase">
          {site.brand}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          바로 쓰는 계산기
        </h1>
        <p className="text-sm leading-6 text-stone-600 sm:text-base">
          사칙연산, 메모리, 계산 기록을 지원합니다. 키보드로도 입력할 수
          있습니다.
        </p>
        {locked ? (
          <p className="text-sm text-stone-600">
            공개 주소{" "}
            <a
              href={site.url}
              className="font-medium text-stone-900 underline underline-offset-4"
            >
              {site.domain}
            </a>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Link href="/connect/" className={cn(buttonVariants())}>
              도메인 확정하기
            </Link>
            <Link
              href="/guide/"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              아직 주소가 없다면
            </Link>
          </div>
        )}
      </div>
      <Calculator />
      <p className="mt-6 text-xs text-stone-500">
        숫자와 <span className="font-mono">+ − × ÷</span>, Enter, Esc,
        Backspace를 사용할 수 있습니다.
      </p>
    </SiteShell>
  );
}
