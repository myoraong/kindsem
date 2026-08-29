import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <SiteShell current="home" width="narrow">
      <div className="flex flex-1 flex-col justify-center py-8 text-center">
        <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase">
          404
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          주소가 바뀌었거나 아직 배포되지 않은 경로입니다.
        </p>
        <Link href="/" className={cn(buttonVariants(), "mt-6 self-center")}>
          계산기로 돌아가기
        </Link>
      </div>
    </SiteShell>
  );
}
