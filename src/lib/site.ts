import { SITE_DOMAIN } from "@/lib/site-domain";

export const site = {
  name: "KindSem",
  brand: "KindSem",
  description:
    "친절한 셈. 브라우저에서 바로 쓰는 계산기.",
  domain: SITE_DOMAIN,
  url: SITE_DOMAIN ? `https://${SITE_DOMAIN}` : "",
};

export function isDomainLocked(): boolean {
  return site.domain.length > 0;
}
