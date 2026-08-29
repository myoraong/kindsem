import Link from "next/link";

import { isDomainLocked, site } from "@/lib/site";

export function SiteFooter() {
  const locked = isDomainLocked();

  return (
    <footer className="border-t border-stone-200/80">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-4 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          {site.brand} · {site.name}
        </p>
        {locked ? (
          <p>
            연결됨{" "}
            <a
              href={site.url}
              className="font-medium text-stone-800 underline underline-offset-4"
            >
              {site.domain}
            </a>
          </p>
        ) : (
          <p>
            도메인 미연결 ·{" "}
            <Link
              href="/connect/"
              className="font-medium text-stone-800 underline underline-offset-4"
            >
              사서 확정하기
            </Link>
          </p>
        )}
      </div>
    </footer>
  );
}
