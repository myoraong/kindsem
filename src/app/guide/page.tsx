import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleAlert,
  CircleCheck,
  CreditCard,
  ExternalLink,
  Mail,
  Search,
} from "lucide-react";

import { SiteShell } from "@/components/site-shell";
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

export const metadata: Metadata = {
  title: "Cloudflare에서 도메인 사기",
  description:
    "Cloudflare Registrar에서 계산기 사이트 도메인을 사는 순서. 계정, 검색, 영문 연락처, 결제, ICANN 메일 인증까지.",
};

export default function GuidePage() {
  return (
    <SiteShell current="guide" width="narrow">
      <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase">
        Cloudflare Registrar
      </p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Cloudflare에서 도메인 사는 법
      </h1>
      <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">
        Cloudflare는 도메인만 팔고 호스팅을 끼워 팔지 않습니다. 화면은 영어이고,
        결제는 여기서 대신할 수 없습니다. 산 뒤에는{" "}
        <Link
          href="/connect/"
          className="font-medium text-stone-900 underline underline-offset-4"
        >
          도메인 확정
        </Link>
        에서 이 사이트에 바로 붙입니다.
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
              .
            </p>
            <p>
              3. 검색 → 원하는 줄의 <Badge variant="secondary">Purchase</Badge>
            </p>
            <p>
              4. 기간 1년, 영문 연락처, 카드 또는 PayPal →{" "}
              <Badge variant="secondary">Complete purchase</Badge>
            </p>
            <p>
              5. Manage domains 목록에 주소가 보이면 산 것입니다. 그다음{" "}
              <Link
                href="/connect/"
                className="font-medium underline underline-offset-4"
              >
                도메인 확정
              </Link>
              으로 가세요.
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
            가격은 등록소가 받는 원가에 가깝습니다. .com 은 보통 연 10달러대입니다.
          </li>
          <li className="flex gap-2">
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-amber-700" />
            카드가 거절되면 해외 결제를 켠 뒤 다시 시도하거나 PayPal을 쓰세요.
          </li>
          <li className="flex gap-2">
            <Mail className="mt-0.5 size-4 shrink-0 text-amber-700" />
            ICANN 이메일 인증 링크를 반드시 누르세요. 안 누르면 도메인이
            정지됩니다.
          </li>
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-2">
        <Link href="/connect/" className={cn(buttonVariants())}>
          샀으면 도메인 확정
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
    </SiteShell>
  );
}
