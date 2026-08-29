import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#DDD4C4]">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-4 text-xs text-[#7A7168] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{site.brand}</p>
        <p>{site.domain}</p>
      </div>
    </footer>
  );
}
