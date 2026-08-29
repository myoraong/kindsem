import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

export function SiteShell({
  current,
  children,
  width = "wide",
}: {
  current: "home" | "guide" | "connect";
  children: ReactNode;
  width?: "wide" | "narrow";
}) {
  return (
    <div className="flex min-h-full flex-col bg-[#faf7f2] text-stone-900">
      <SiteHeader current={current} />
      <main
        className={cn(
          "mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10",
          width === "wide" ? "max-w-5xl" : "max-w-3xl",
        )}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
