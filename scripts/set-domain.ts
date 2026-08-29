import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeDomain } from "../src/lib/domain.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const input = process.argv[2] ?? "";
const domain = normalizeDomain(input);

if (!domain) {
  console.error("사용법: npm run set-domain -- mycalc.com");
  console.error("https:// 나 www. 를 붙여 넣어도 됩니다. 한글 도메인과 .kr 은 Cloudflare에서 살 수 없습니다.");
  process.exit(1);
}

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(join(root, "public", "CNAME"), `${domain}\n`);
writeFileSync(
  join(root, "src", "lib", "site-domain.ts"),
  `export const SITE_DOMAIN = ${JSON.stringify(domain)};\n`,
);

console.log(`도메인을 ${domain} 으로 확정했습니다.`);
console.log("다음: git add public/CNAME src/lib/site-domain.ts && git commit && git push");
console.log("GitHub Settings → Pages → Custom domain 에도 같은 주소를 넣고, Cloudflare DNS는 DNS only 로 두세요.");
