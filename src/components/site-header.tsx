import Link from "next/link";
import { Calculator as CalculatorIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader({
  current,
}: {
  current: "home" | "guide" | "connect";
}) {
  return (
    <header className="border-b border-[#DDD4C4] bg-[#F4EFE4]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-[#1C1915]">
          <span className="flex size-8 items-center justify-center rounded-xl bg-[#1C1915] text-[#E2B54A]">
            <CalculatorIcon className="size-4" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight">
            KindSem
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              buttonVariants({
                variant: current === "home" ? "secondary" : "ghost",
                size: "sm",
              }),
            )}
          >
            계산기
          </Link>
        </nav>
      </div>
    </header>
  );
}
