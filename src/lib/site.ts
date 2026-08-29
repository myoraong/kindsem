import { SITE_DOMAIN } from "@/lib/site-domain";

export const site = {
  name: "계산기",
  brand: "DeskCalc",
  description:
    "브라우저에서 바로 쓰는 계산기. 사칙연산, 메모리, 계산 기록, 키보드 입력을 지원합니다.",
  domain: SITE_DOMAIN,
  url: SITE_DOMAIN ? `https://${SITE_DOMAIN}` : "",
};

export function isDomainLocked(): boolean {
  return site.domain.length > 0;
}
