export const GITHUB_PAGES_IPV4 = [
  "185.199.108.153",
  "185.199.109.153",
  "185.199.110.153",
  "185.199.111.153",
] as const;

export const GITHUB_PAGES_IPV6 = [
  "2606:50c0:8000::153",
  "2606:50c0:8001::153",
  "2606:50c0:8002::153",
  "2606:50c0:8003::153",
] as const;

export type DnsRecord = {
  type: "A" | "AAAA" | "CNAME";
  name: string;
  content: string;
  proxy: "DNS only";
};

export function normalizeDomain(raw: string): string | null {
  let value = raw.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "");
  value = value.replace(/\/.*$/, "");
  value = value.replace(/:\d+$/, "");
  value = value.replace(/\.$/, "");
  if (value.startsWith("www.")) {
    value = value.slice(4);
  }
  if (value.length > 253) return null;
  if (
    !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
      value,
    )
  ) {
    return null;
  }
  return value;
}

export function normalizeGitHubUser(raw: string): string | null {
  const value = raw.trim();
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(value)) {
    return null;
  }
  return value;
}

export function buildDnsRecords(githubUser: string): DnsRecord[] {
  return [
    ...GITHUB_PAGES_IPV4.map((content) => ({
      type: "A" as const,
      name: "@",
      content,
      proxy: "DNS only" as const,
    })),
    ...GITHUB_PAGES_IPV6.map((content) => ({
      type: "AAAA" as const,
      name: "@",
      content,
      proxy: "DNS only" as const,
    })),
    {
      type: "CNAME",
      name: "www",
      content: `${githubUser}.github.io`,
      proxy: "DNS only",
    },
  ];
}

export function setDomainCommand(domain: string): string {
  return `npm run set-domain -- ${domain}`;
}
