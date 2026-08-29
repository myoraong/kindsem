import Link from "next/link";
import { Calculator as CalculatorIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader({ current }: { current: "home" | "guide" }) {
  return (
    <header className="border-b border-stone-200/80 bg-[#faf7f2]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-stone-900">
          <span className="flex size-8 items-center justify-center rounded-xl bg-stone-900 text-amber-300">
            <CalculatorIcon className="size-4" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight">
            계산기
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
          <Link
            href="/guide/"
            className={cn(
              buttonVariants({
                variant: current === "guide" ? "secondary" : "ghost",
                size: "sm",
              }),
            )}
          >
            도메인 연결
            <Badge variant="outline" className="ml-1 hidden sm:inline-flex">
              GitHub
            </Badge>
          </Link>
        </nav>
      </div>
    </header>
  );
}
