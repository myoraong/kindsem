"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildDnsRecords,
  normalizeDomain,
  normalizeGitHubUser,
  setDomainCommand,
  type DnsRecord,
} from "@/lib/domain";
import { site } from "@/lib/site";

type Plan = {
  domain: string;
  githubUser: string;
  records: DnsRecord[];
  command: string;
};

export function DomainLockForm() {
  const [domainInput, setDomainInput] = useState(site.domain);
  const [githubInput, setGithubInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const domain = normalizeDomain(domainInput);
    const githubUser = normalizeGitHubUser(githubInput);
    if (!domain) {
      setPlan(null);
      setError("도메인 형식이 아닙니다. 예: mycalc.com");
      return;
    }
    if (!githubUser) {
      setPlan(null);
      setError("GitHub 아이디를 확인해 주세요. 예: octocat");
      return;
    }
    setError(null);
    setPlan({
      domain,
      githubUser,
      records: buildDnsRecords(githubUser),
      command: setDomainCommand(domain),
    });
  }

  return (
    <div className="space-y-6">
      {site.domain ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-200">
          저장소에는 이미 <span className="font-mono">{site.domain}</span> 이
          확정되어 있습니다. 다른 주소로 바꾸려면 아래에서 다시 준비한 뒤{" "}
          <span className="font-mono">npm run set-domain</span> 을 실행하세요.
        </p>
      ) : (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-200">
          아직 주소가 연결되지 않았습니다. Cloudflare에서 산 도메인과 GitHub
          아이디를 넣으면, 바로 붙여 넣을 DNS와 확정 명령이 나옵니다.
        </p>
      )}

      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle>산 주소를 넣기</CardTitle>
          <CardDescription className="leading-6">
            브라우저에서 파일을 쓰지는 않습니다. 나온 명령을 로컬에서 실행한 뒤
            커밋하면 사이트가 그 도메인으로 확정됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="domain">Cloudflare에서 산 도메인</Label>
              <Input
                id="domain"
                name="domain"
                value={domainInput}
                onChange={(event) => setDomainInput(event.target.value)}
                placeholder="mycalc.com"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="h-10 font-mono"
                aria-invalid={error?.includes("도메인") || undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="github">GitHub 아이디</Label>
              <Input
                id="github"
                name="github"
                value={githubInput}
                onChange={(event) => setGithubInput(event.target.value)}
                placeholder="octocat"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="h-10 font-mono"
                aria-invalid={error?.includes("GitHub") || undefined}
              />
            </div>
            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="h-10 px-4">
              이 주소로 확정 준비
            </Button>
          </form>
        </CardContent>
      </Card>

      {plan ? <LockPlan plan={plan} /> : null}
    </div>
  );
}

function LockPlan({ plan }: { plan: Plan }) {
  return (
    <div className="space-y-4">
      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle>1. 저장소에 확정</CardTitle>
          <CardDescription className="leading-6">
            프로젝트 폴더에서 실행하면 <span className="font-mono">public/CNAME</span>
            과 사이트 주소가 <span className="font-mono">{plan.domain}</span> 으로
            바뀝니다. 커밋 후 main에 푸시하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <CopyBlock value={plan.command} />
          <CopyBlock
            label="public/CNAME"
            value={plan.domain}
          />
        </CardContent>
      </Card>

      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle>2. GitHub Pages</CardTitle>
          <CardDescription className="leading-6">
            저장소 Settings → Pages에서 Source는 GitHub Actions, Custom domain은
            아래 값입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CopyBlock label="Custom domain" value={plan.domain} />
        </CardContent>
      </Card>

      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle>3. Cloudflare DNS</CardTitle>
          <CardDescription className="leading-6">
            {plan.domain} → DNS → Records. Proxy는 전부 DNS only (회색 구름).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl ring-1 ring-stone-200">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="bg-stone-100 text-xs tracking-wide text-stone-500 uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Content</th>
                  <th className="px-3 py-2 font-medium">Proxy</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs text-stone-800">
                {plan.records.map((row) => (
                  <tr
                    key={`${row.type}-${row.name}-${row.content}`}
                    className="border-t border-stone-200"
                  >
                    <td className="px-3 py-2">{row.type}</td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.content}</td>
                    <td className="px-3 py-2">{row.proxy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CopyBlock({ label, value }: { label?: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const title = useMemo(() => label ?? "복사", [label]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-1.5">
      {label ? (
        <p className="text-xs font-medium text-stone-500">{title}</p>
      ) : null}
      <div className="flex items-center gap-2 rounded-lg bg-stone-900 p-2 pl-3">
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-amber-100">
          {value}
        </code>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-stone-300 hover:bg-stone-800 hover:text-white"
          onClick={() => void copy()}
          aria-label={`${title} 복사`}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
    </div>
  );
}
