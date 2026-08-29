import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  CircleCheck,
  ExternalLink,
  GitBranch,
  Globe,
  Link2,
  ShoppingCart,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STEPS = [
  {
    title: "GitHub 저장소 만들기",
    body: "이 프로젝트는 아직 GitHub 저장소가 아닙니다. Cursor에서 Create repo 버튼을 눌러 GitHub 저장소를 만든 뒤, 아래 Pages 설정을 진행하세요.",
  },
  {
    title: "도메인 구매",
    body: "Cloudflare, 가비아, 후이즈 같은 등록 기관에서 원하는 주소를 검색해 결제합니다. 연 단위로 갱신해야 하며, 등록 기관이 DNS를 관리하게 두는 것이 가장 단순합니다.",
  },
  {
    title: "GitHub Pages 켜기",
    body: "저장소 Settings → Pages에서 Source를 GitHub Actions로 바꿉니다. main에 푸시하면 이 저장소의 배포 워크플로가 정적 사이트를 올립니다.",
  },
  {
    title: "DNS 레코드 연결",
    body: "루트 도메인에는 GitHub Pages A/AAAA 레코드를, www에는 CNAME을 넣습니다. 전파에는 몇 분에서 몇 시간까지 걸릴 수 있습니다.",
  },
  {
    title: "사용자 지정 도메인 저장",
    body: "GitHub Pages 설정에 구매한 도메인을 입력하고 DNS check가 통과할 때까지 기다립니다. Enforce HTTPS가 켜지면 연결이 끝입니다.",
  },
];

const APEX_A = [
  "185.199.108.153",
  "185.199.109.153",
  "185.199.110.153",
  "185.199.111.153",
];

const APEX_AAAA = [
  "2606:50c0:8000::153",
  "2606:50c0:8001::153",
  "2606:50c0:8002::153",
  "2606:50c0:8003::153",
];

export const metadata: Metadata = {
  title: "도메인 연결",
  description:
    "계산기 사이트를 GitHub Pages에 올리고, 구매한 도메인을 DNS와 사용자 지정 도메인으로 연결하는 순서입니다.",
};

export default function GuidePage() {
  return (
    <div className="flex min-h-full flex-col bg-[#faf7f2] text-stone-900">
      <SiteHeader current="guide" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase">
          배포 가이드
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          도메인을 사서 GitHub에 붙이기
        </h1>
        <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">
          이 계산기는 GitHub Pages에서 무료로 호스팅할 수 있게 만들어 두었습니다.
          도메인 결제와 DNS 변경은 등록 기관 계정에서만 할 수 있어서, 여기서는
          클릭 순서와 넣어야 할 값을 그대로 안내합니다.
        </p>

        <ol className="mt-8 space-y-4">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="bg-white/80">
                <CardHeader className="border-b">
                  <div className="flex items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-amber-300">
                      {index + 1}
                    </span>
                    <div>
                      <CardTitle>{step.title}</CardTitle>
                      <CardDescription className="mt-1 leading-6">
                        {step.body}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-xl font-semibold">도메인 사는 곳</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <RegistrarCard
              name="Cloudflare"
              note="가격이 저렴하고 DNS가 강력합니다. 영문 인터페이스입니다."
              href="https://dash.cloudflare.com/"
              icon={<Globe className="size-4" />}
            />
            <RegistrarCard
              name="가비아"
              note="한국어 결제와 세금계산서에 익숙합니다. .kr 도메인에 자주 씁니다."
              href="https://www.gabia.com/"
              icon={<ShoppingCart className="size-4" />}
            />
            <RegistrarCard
              name="후이즈"
              note="국내 등록 기관입니다. 구매 후 네임서버를 꼭 확인하세요."
              href="https://whois.co.kr/"
              icon={<Link2 className="size-4" />}
            />
          </div>
          <p className="text-sm leading-6 text-stone-600">
            계산기 사이트라면 <span className="font-medium">짧은 .com / .kr</span>
            또는 <span className="font-medium">calc.내이름.com</span> 같은
            하위 도메인도 충분합니다. 이미 가지고 있는 도메인이 있다면 새로 살
            필요 없이 4단계 DNS만 진행하면 됩니다.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <div className="flex items-center gap-2">
            <GitBranch className="size-5" />
            <h2 className="font-heading text-xl font-semibold">
              GitHub Pages 설정
            </h2>
          </div>
          <Card className="bg-white/80">
            <CardContent className="space-y-3 pt-1 text-sm leading-6 text-stone-700">
              <p>
                1. GitHub 저장소에서{" "}
                <span className="font-medium">Settings → Pages</span>로
                갑니다.
              </p>
              <p>
                2. Build and deployment의 Source를{" "}
                <Badge variant="secondary">GitHub Actions</Badge> 로
                선택합니다. 이 저장소에는 이미{" "}
                <span className="font-mono text-xs">
                  .github/workflows/deploy-pages.yml
                </span>{" "}
                이 들어 있습니다.
              </p>
              <p>
                3. Custom domain에 구매한 주소(예:{" "}
                <span className="font-mono text-xs">calc.example.com</span>)를
                입력하고 Save를 누릅니다.
              </p>
              <p>
                4. DNS check가 초록색이 되면 Enforce HTTPS를 켭니다. 인증서
                발급까지 조금 기다리면 https로 열립니다.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-xl font-semibold">
            넣어야 하는 DNS 값
          </h2>
          <p className="text-sm leading-6 text-stone-600">
            예: 도메인이 <span className="font-mono text-xs">example.com</span>
            이고 GitHub 아이디가{" "}
            <span className="font-mono text-xs">yourname</span> 일 때입니다.
            아이디는 GitHub 프로필 URL의 그 이름입니다.
          </p>
          <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-stone-100 text-xs tracking-wide text-stone-500 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">호스트</th>
                  <th className="px-4 py-3 font-medium">유형</th>
                  <th className="px-4 py-3 font-medium">값</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs text-stone-800">
                {APEX_A.map((ip) => (
                  <tr key={ip} className="border-t border-stone-200">
                    <td className="px-4 py-2.5">@</td>
                    <td className="px-4 py-2.5">A</td>
                    <td className="px-4 py-2.5">{ip}</td>
                  </tr>
                ))}
                {APEX_AAAA.map((ip) => (
                  <tr key={ip} className="border-t border-stone-200">
                    <td className="px-4 py-2.5">@</td>
                    <td className="px-4 py-2.5">AAAA</td>
                    <td className="px-4 py-2.5">{ip}</td>
                  </tr>
                ))}
                <tr className="border-t border-stone-200">
                  <td className="px-4 py-2.5">www</td>
                  <td className="px-4 py-2.5">CNAME</td>
                  <td className="px-4 py-2.5">yourname.github.io</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm leading-6 text-stone-600">
            하위 도메인만 쓸 경우(예: calc.example.com)에는 A 레코드 대신
            CNAME 하나만 있으면 됩니다. 호스트는{" "}
            <span className="font-mono text-xs">calc</span>, 값은{" "}
            <span className="font-mono text-xs">yourname.github.io</span>.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-xl font-semibold">
            저장소에 도메인 파일 넣기
          </h2>
          <Card className="bg-white/80">
            <CardContent className="space-y-3 pt-1 text-sm leading-6 text-stone-700">
              <p>
                GitHub가 배포할 때마다 도메인을 기억하도록{" "}
                <span className="font-mono text-xs">public/CNAME</span> 파일을
                만듭니다. 내용에는 도메인만 한 줄 적습니다.
              </p>
              <pre className="overflow-x-auto rounded-lg bg-stone-900 p-4 font-mono text-xs text-amber-100">
                calc.example.com
              </pre>
              <p>
                커밋 후 main에 푸시하면 Actions가 사이트를 다시 올립니다. 사용자
                지정 도메인을 쓰면{" "}
                <span className="font-mono text-xs">NEXT_PUBLIC_BASE_PATH</span>
                는 비워 두면 됩니다.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-heading text-xl font-semibold">자주 막히는 지점</h2>
          <ul className="space-y-2 text-sm leading-6 text-stone-600">
            <li className="flex gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-amber-700" />
              Cloudflare를 쓸 때는 주황색 구름(프록시)을 끄고 DNS only로 두는
              편이 GitHub Pages 인증서와 잘 맞습니다.
            </li>
            <li className="flex gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-amber-700" />
              Pages Source가 Deploy from a branch로 되어 있으면 Actions 배포가
              무시됩니다. GitHub Actions로 바꾸세요.
            </li>
            <li className="flex gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-amber-700" />
              도메인만 사고 GitHub 저장소를 만들지 않으면 연결할 대상이 없습니다.
              반드시 Create repo 후 Pages를 켭니다.
            </li>
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-2">
          <Link href="/" className={cn(buttonVariants())}>
            계산기로 돌아가기
          </Link>
          <a
            href="https://docs.github.com/ko/pages/configuring-a-custom-domain-for-your-github-pages-site"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            GitHub 공식 문서
            <ExternalLink data-icon="inline-end" />
          </a>
        </div>
      </main>
    </div>
  );
}

function RegistrarCard({
  name,
  note,
  href,
  icon,
}: {
  name: string;
  note: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-xl bg-white p-4 ring-1 ring-stone-200 transition-colors hover:bg-stone-50"
    >
      <p className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {name}
        <ExternalLink className="size-3.5 text-stone-400" />
      </p>
      <p className="mt-2 text-xs leading-5 text-stone-600">{note}</p>
    </a>
  );
}
