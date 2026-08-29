import type { Metadata } from "next";
import Link from "next/link";

import { DomainLockForm } from "@/components/domain-lock";
import { SiteShell } from "@/components/site-shell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "도메인 확정",
  description:
    "Cloudflare에서 산 도메인을 계산기 사이트와 GitHub Pages에 바로 붙이는 확정 단계입니다.",
};

export default function ConnectPage() {
  return (
    <SiteShell current="connect" width="narrow">
      <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase">
        사이트 뼈대
      </p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        도메인 확정
      </h1>
      <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">
        계산기 화면과 GitHub Pages 배포는 이미 준비되어 있습니다. 주소를 산
        뒤에 여기 넣고, 나온 명령을 실행하면 이 사이트가 그 도메인으로
        고정됩니다. 아직 안 샀다면{" "}
        <Link
          href="/guide/"
          className="font-medium text-stone-900 underline underline-offset-4"
        >
          Cloudflare에서 사는 법
        </Link>
        을 먼저 보세요.
        {site.domain
          ? ` 현재 확정된 주소는 ${site.domain} 입니다.`
          : null}
      </p>
      <div className="mt-8">
        <DomainLockForm />
      </div>
    </SiteShell>
  );
}
