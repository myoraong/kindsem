import { Calculator } from "@/components/calculator";
import { SiteShell } from "@/components/site-shell";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <SiteShell current="home">
      <div className="mb-8 flex max-w-xl flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#C4922A] uppercase">
          {site.brand}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          친절한 셈
        </h1>
        <p className="text-sm leading-6 text-[#7A7168] sm:text-base">
          종이 위의 계산기. 사칙연산, 메모리, 기록을 조용히 처리합니다.
        </p>
      </div>
      <Calculator />
      <p className="mt-6 text-xs text-[#7A7168]">
        숫자와 <span className="font-mono">+ − × ÷</span>, Enter, Esc,
        Backspace를 사용할 수 있습니다.
      </p>
    </SiteShell>
  );
}
