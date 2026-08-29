import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleAlert,
  CircleCheck,
  CreditCard,
  ExternalLink,
  GitBranch,
  Mail,
  Search,
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

const CF_STEPS = [
  {
    title: "Cloudflare 계정을 만든다",
    body: "dash.cloudflare.com/sign-up 에서 이메일과 비밀번호로 가입합니다. 가입 확인 메일의 링크를 눌러 이메일을 인증해야 도메인을 살 수 있습니다. 스팸함도 확인하세요.",
  },
  {
    title: "영문 이름을 정한다",
    body: "주소창에 칠 글자입니다. mycalc, deskcalc처럼 짧고 읽기 쉬운 영문이 좋습니다. Cloudflare는 한글 도메인(IDN)을 팔지 않고, .kr 도 없습니다. 처음이면 .com 을 고르면 됩니다.",
  },
  {
    title: "Register domains에서 검색한다",
    body: "대시보드 왼쪽에서 Domain Registration → Register domains 로 갑니다. 검색창에 mycalc.com 처럼 이름과 확장자를 넣고 Search를 누릅니다. 결과에 없고 가격이 안 보이면 이미 쓰이거나 Cloudflare가 취급하지 않는 확장자입니다.",
  },
  {
    title: "Purchase로 1년을 고른다",
    body: "원하는 줄의 Purchase를 누릅니다. Payment option에서 기간은 1년이면 충분합니다. Auto-renew는 기본으로 켜져 있어서, 만료 전에 같은 카드로 자동 연장됩니다. 원치 않으면 산 뒤에 끌 수 있습니다.",
  },
  {
    title: "연락처를 영문으로 적는다",
    body: "이름, 성, 이메일, 전화, 주소, 도시, 주/도, 국가, 우편번호가 필요합니다. 한글은 거절됩니다. 이름은 Kim, 주소는 Seoul, Gangnam-gu처럼 로마자로 적습니다. 이 정보는 WHOIS에서 가려지지만, ICANN 확인 메일은 여기 이메일로 옵니다.",
  },
  {
    title: "카드로 결제하고 메일을 확인한다",
    body: "Complete purchase를 누릅니다. 국내 카드는 해외 결제(해외원화/온라인 해외결제)가 켜져 있어야 합니다. 결제가 막히면 PayPal도 됩니다. 끝난 뒤 두 통을 기다립니다. 하나는 Cloudflare 구매 확인, 하나는 ICANN 등록자 이메일 인증입니다. 인증을 안 누르면 도메인이 정지됩니다.",
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
  title: "Cloudflare에서 도메인 사기",
  description:
    "Cloudflare Registrar에서 계산기 사이트 도메인을 사는 순서. 계정, 검색, 영문 연락처, 결제, ICANN 메일 인증까지.",
};

export default function GuidePage() {
  return (
    <div className="flex min-h-full flex-col bg-[#faf7f2] text-stone-900">
      <SiteHeader current="guide" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase">
          Cloudflare Registrar
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Cloudflare에서 도메인 사는 법
        </h1>
        <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">
          Cloudflare는 도메인만 팔고 호스팅을 끼워 팔지 않습니다. 화면은 영어이고,
          결제는 여기서 대신할 수 없습니다. 아래 순서로{" "}
          <a
            href="https://dash.cloudflare.com/sign-up"
            className="font-medium text-stone-900 underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            dash.cloudflare.com
          </a>
          에서 진행하세요.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href="https://dash.cloudflare.com/sign-up"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants())}
          >
            Cloudflare 가입
            <ExternalLink data-icon="inline-end" />
          </a>
          <a
            href="https://dash.cloudflare.com/?to=/:account/domains/register"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            도메인 검색
            <ExternalLink data-icon="inline-end" />
          </a>
        </div>

        <Card className="mt-8 bg-amber-50/80 ring-amber-200/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CircleAlert className="size-4 text-amber-800" />
              Cloudflare에서 안 되는 것
            </CardTitle>
            <CardDescription className="leading-6 text-stone-700">
              <span className="font-medium">.kr</span> 과 한글 주소는 살 수
              없습니다. 연락처도 한글이면 등록이 막힙니다. 계산기라면{" "}
              <span className="font-mono text-xs">mycalc.com</span> 같은 .com 을
              고르면 됩니다.
            </CardDescription>
          </CardHeader>
        </Card>

        <ol className="mt-8 space-y-4">
          {CF_STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="bg-white/80">
                <CardHeader>
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
          <div className="flex items-center gap-2">
            <Search className="size-5" />
            <h2 className="font-heading text-xl font-semibold">
              대시보드에서 누르는 곳
            </h2>
          </div>
          <Card className="bg-white/80">
            <CardContent className="space-y-3 pt-1 text-sm leading-6 text-stone-700">
              <p>
                1.{" "}
                <a
                  href="https://dash.cloudflare.com/sign-up"
                  className="font-medium underline underline-offset-4"
                  target="_blank"
                  rel="noreferrer"
                >
                  가입
                </a>
                후 이메일 인증.
              </p>
              <p>
                2. 왼쪽 메뉴{" "}
                <span className="font-medium">
                  Domain Registration → Register domains
                </span>
                . 바로 가려면{" "}
                <a
                  href="https://dash.cloudflare.com/?to=/:account/domains/register"
                  className="font-medium underline underline-offset-4"
                  target="_blank"
                  rel="noreferrer"
                >
                  등록 페이지
                </a>
                를 엽니다.
              </p>
              <p>
                3. 검색 → 원하는 줄의{" "}
                <Badge variant="secondary">Purchase</Badge>
              </p>
              <p>
                4. 기간 1년, 영문 연락처, 카드 또는 PayPal →{" "}
                <Badge variant="secondary">Complete purchase</Badge>
              </p>
              <p>
                5. Domain Registration → Manage domains 목록에 주소가 보이면
                산 것입니다. 브라우저에 쳐도 아직 계산기는 안 열립니다.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5" />
            <h2 className="font-heading text-xl font-semibold">결제와 메일</h2>
          </div>
          <ul className="space-y-2 text-sm leading-6 text-stone-600">
            <li className="flex gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-amber-700" />
              가격은 등록소가 받는 원가에 가깝습니다. .com 은 보통 연 10달러대이고,
              첫해만 싼 행사는 거의 없습니다.
            </li>
            <li className="flex gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-amber-700" />
              카드가 거절되면 앱에서 해외 결제를 켠 뒤 다시 시도하거나 PayPal을
              쓰세요. 체크카드보다 신용카드가 통과하기 쉽습니다.
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-amber-700" />
              제목에 ICANN 또는 verify your email 이 있는 메일의 링크를 반드시
              누르세요. 안 누르면 네임서버가 주차 서버로 바뀌어 사이트가 안
              열립니다.
            </li>
          </ul>
        </section>

        <section className="mt-12 space-y-4 border-t border-stone-200 pt-10">
          <div className="flex items-center gap-2">
            <GitBranch className="size-5" />
            <h2 className="font-heading text-xl font-semibold">
              산 다음: GitHub에 붙이기
            </h2>
          </div>
          <p className="text-sm leading-6 text-stone-600">
            Cloudflare에서 산 도메인은 네임서버가 이미 Cloudflare입니다. 가비아처럼
            네임서버를 바꿀 필요는 없고, DNS 레코드만 넣으면 됩니다. 이 프로젝트는
            아직 GitHub 저장소가 아니므로 Cursor에서 Create repo를 먼저 누르세요.
          </p>
          <Card className="bg-white/80">
            <CardContent className="space-y-3 pt-1 text-sm leading-6 text-stone-700">
              <p>
                1. GitHub 저장소{" "}
                <span className="font-medium">Settings → Pages</span> 에서
                Source를 <Badge variant="secondary">GitHub Actions</Badge> 로
                바꿉니다.
              </p>
              <p>
                2. Custom domain에 산 주소(예:{" "}
                <span className="font-mono text-xs">mycalc.com</span>)를 넣고
                Save 합니다.
              </p>
              <p>
                3. Cloudflare에서 해당 도메인 →{" "}
                <span className="font-medium">DNS → Records</span> 로 가 아래
                표를 추가합니다.
              </p>
              <p>
                4. 각 레코드의 Proxy status는{" "}
                <Badge variant="secondary">DNS only</Badge> (회색 구름)로
                둡니다. 주황색 프록시를 켜면 GitHub HTTPS 발급이 자주 실패합니다.
              </p>
              <p>
                5. GitHub의 DNS check가 통과하면 Enforce HTTPS를 켭니다.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-xl font-semibold">
            Cloudflare DNS에 넣을 값
          </h2>
          <p className="text-sm leading-6 text-stone-600">
            Type / Name / Content 칸에 이렇게 넣습니다. Name이 @ 이면 루트
            도메인입니다. GitHub 아이디가 yourname 일 때의 예입니다.
          </p>
          <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-stone-100 text-xs tracking-wide text-stone-500 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Content</th>
                  <th className="px-4 py-3 font-medium">Proxy</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs text-stone-800">
                {APEX_A.map((ip) => (
                  <tr key={ip} className="border-t border-stone-200">
                    <td className="px-4 py-2.5">A</td>
                    <td className="px-4 py-2.5">@</td>
                    <td className="px-4 py-2.5">{ip}</td>
                    <td className="px-4 py-2.5">DNS only</td>
                  </tr>
                ))}
                {APEX_AAAA.map((ip) => (
                  <tr key={ip} className="border-t border-stone-200">
                    <td className="px-4 py-2.5">AAAA</td>
                    <td className="px-4 py-2.5">@</td>
                    <td className="px-4 py-2.5">{ip}</td>
                    <td className="px-4 py-2.5">DNS only</td>
                  </tr>
                ))}
                <tr className="border-t border-stone-200">
                  <td className="px-4 py-2.5">CNAME</td>
                  <td className="px-4 py-2.5">www</td>
                  <td className="px-4 py-2.5">yourname.github.io</td>
                  <td className="px-4 py-2.5">DNS only</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm leading-6 text-stone-600">
            하위 도메인만 쓸 경우(예: calc.example.com)에는 A 레코드 대신 CNAME
            하나만 있으면 됩니다. Name은{" "}
            <span className="font-mono text-xs">calc</span>, Content는{" "}
            <span className="font-mono text-xs">yourname.github.io</span>, Proxy는
            DNS only.
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
                mycalc.com
              </pre>
            </CardContent>
          </Card>
        </section>

        <div className="mt-10 flex flex-wrap gap-2">
          <Link href="/" className={cn(buttonVariants())}>
            계산기로 돌아가기
          </Link>
          <a
            href="https://developers.cloudflare.com/registrar/get-started/register-domain/"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cloudflare 공식 문서
            <ExternalLink data-icon="inline-end" />
          </a>
        </div>
      </main>
    </div>
  );
}
