import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  CircleCheck,
  CircleAlert,
  CreditCard,
  ExternalLink,
  GitBranch,
  Globe,
  Link2,
  Search,
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

const BUY_STEPS = [
  {
    title: "이름을 정한다",
    body: "주소창에 칠 글자입니다. 계산기라면 calc, calculator, 내이름calc처럼 짧고 읽기 쉬운 영문이 무난합니다. 한글 도메인(.kr)도 살 수 있지만, 나중에 GitHub와 붙이려면 영문 주소가 훨씬 수월합니다.",
  },
  {
    title: "확장자를 고른다",
    body: "처음이면 .com 을 고르면 됩니다. 한국 사이트라는 느낌을 내고 싶으면 .kr 도 좋습니다. .kr 은 국내 등록 기관에서 휴대폰 본인 인증이 필요한 경우가 많습니다. .shop, .site 같은 싼 확장자는 나중에 스팸으로 오해받기 쉬워 비추천입니다.",
  },
  {
    title: "등록 기관에 가입한다",
    body: "한국어와 카드 결제가 편하면 가비아, 가격만 보면 Cloudflare입니다. 둘 중 한곳에 이메일로 회원가입하면 됩니다. 이 단계에서는 웹호스팅, 메일, SSL 상품을 같이 사지 마세요. 필요한 것은 도메인 이름뿐입니다.",
  },
  {
    title: "검색해서 빈 주소를 확인한다",
    body: "사이트 큰 검색창에 mycalc 처럼 이름만 넣고 검색합니다. 초록색이나 ‘등록 가능’이면 살 수 있습니다. 이미 사용 중이면 철자를 바꾸거나 다른 확장자를 고릅니다. 누가 쓰던 주소를 되파는 프리미엄 매물은 비싸니 건너뛰세요.",
  },
  {
    title: "기간만 넣고 결제한다",
    body: "1년이면 충분합니다. 장바구니에 호스팅·빌더·보안 인증서가 자동으로 담기면 전부 빼세요. 소유자 이름, 이메일, 전화는 실제로 받을 수 있는 정보로 적습니다. 만료 안내가 그 메일로 옵니다.",
  },
  {
    title: "내 도메인인지 확인한다",
    body: "결제 직후 마이페이지의 도메인 목록에 주소가 보이면 산 것입니다. 브라우저에 쳐도 아직 계산기 사이트는 안 열립니다. 지금은 이름만 확보한 상태이고, 그다음에 GitHub와 DNS를 연결합니다.",
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
  title: "도메인 사는 법",
  description:
    "계산기 사이트용 도메인을 처음 사는 순서. 가비아와 Cloudflare에서 이름 검색, 결제, 확인까지 안내합니다.",
};

export default function GuidePage() {
  return (
    <div className="flex min-h-full flex-col bg-[#faf7f2] text-stone-900">
      <SiteHeader current="guide" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase">
          처음부터
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          도메인 사는 법
        </h1>
        <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">
          도메인은 사이트 주소입니다.{" "}
          <span className="font-medium text-stone-800">example.com</span> 같은
          이름을 1년 단위로 빌려 쓰는 것이고, 사는 즉시 계산기가 열리는 것은
          아닙니다. 결제는 등록 기관 사이트에서만 할 수 있습니다.
        </p>

        <Card className="mt-6 bg-amber-50/80 ring-amber-200/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CircleAlert className="size-4 text-amber-800" />
              같이 사지 말 것
            </CardTitle>
            <CardDescription className="leading-6 text-stone-700">
              가비아·후이즈 결제 화면에 웹호스팅, 홈페이지 제작, 기업 메일, SSL
              인증서가 따라옵니다. 이 계산기는 GitHub Pages가 서버 역할을 하므로
              <span className="font-medium"> 도메인만</span> 사면 됩니다. 묶음
              할인은 무시하세요.
            </CardDescription>
          </CardHeader>
        </Card>

        <ol className="mt-8 space-y-4">
          {BUY_STEPS.map((step, index) => (
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
          <h2 className="font-heading text-xl font-semibold">어디서 사나</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <RegistrarCard
              name="가비아"
              note="한국어, 국내 카드 결제, .kr 에 익숙합니다. 처음이면 여기를 추천합니다."
              href="https://www.gabia.com/"
              icon={<ShoppingCart className="size-4" />}
            />
            <RegistrarCard
              name="후이즈"
              note="국내 등록 기관입니다. 검색·결제 흐름은 가비아와 비슷합니다."
              href="https://whois.co.kr/"
              icon={<Link2 className="size-4" />}
            />
            <RegistrarCard
              name="Cloudflare"
              note="영어 화면입니다. .com 가격이 저렴하고 DNS가 강력합니다."
              href="https://dash.cloudflare.com/"
              icon={<Globe className="size-4" />}
            />
          </div>
        </section>

        <section className="mt-10 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="size-5" />
            <h2 className="font-heading text-xl font-semibold">
              가비아에서 사는 클릭 순서
            </h2>
          </div>
          <Card className="bg-white/80">
            <CardContent className="space-y-3 pt-1 text-sm leading-6 text-stone-700">
              <p>
                1.{" "}
                <a
                  href="https://www.gabia.com/"
                  className="font-medium underline underline-offset-4"
                  target="_blank"
                  rel="noreferrer"
                >
                  gabia.com
                </a>{" "}
                에서 회원가입·로그인합니다.
              </p>
              <p>
                2. 화면 위 검색창에 원하는 이름만 넣습니다. 예:{" "}
                <span className="font-mono text-xs">mycalc</span>
              </p>
              <p>
                3. 결과에서 <Badge variant="secondary">등록 가능</Badge> 인
                .com 또는 .kr 을 고르고 장바구니에 담습니다.
              </p>
              <p>
                4. 이용 기간은 1년. 호스팅·메일·SSL·보안이 같이 담겨 있으면
                삭제합니다. 남는 줄은 도메인 한 줄이어야 합니다.
              </p>
              <p>
                5. 소유자 정보에 본인 이름, 연락 가능한 이메일, 전화를 적고
                카드나 계좌로 결제합니다. .kr 이면 휴대폰 본인 인증 창이 뜰 수
                있습니다.
              </p>
              <p>
                6.{" "}
                <span className="font-medium">마이페이지 → 도메인</span> 에
                주소가 보이면 구매가 끝난 것입니다.
              </p>
            </CardContent>
          </Card>
          <p className="text-sm leading-6 text-stone-600">
            Cloudflare를 쓸 때도 흐름은 같습니다. Domain Registration에서 검색 →
            1년 선택 → 결제입니다. 화면이 영어인 점만 다릅니다.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5" />
            <h2 className="font-heading text-xl font-semibold">알아둘 것</h2>
          </div>
          <ul className="space-y-2 text-sm leading-6 text-stone-600">
            <li className="flex gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-amber-700" />
              가격은 확장자와 기관마다 다르고, 보통 1년에 만 원대에서 3만 원대
              사이입니다. 첫해만 싼 행사 가격이면 다음 해 갱신 금액을 확인하세요.
            </li>
            <li className="flex gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-amber-700" />
              도메인은 소유권이 아니라 등록 기간입니다. 만료되면 다른 사람이 가져갈
              수 있으니 자동 갱신을 켜 두는 편이 안전합니다.
            </li>
            <li className="flex gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-amber-700" />
              이미 카카오·네이버·블로그용 주소를 갖고 있다면 새로 살 필요 없습니다.
              그 도메인의 DNS만 아래에서 바꾸면 됩니다.
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
            주소만 샀으면 아직 계산기는 안 열립니다. GitHub 저장소를 만들고
            Pages를 켠 뒤, 등록 기관 DNS에 아래 값을 넣습니다. 이 프로젝트는
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
                2. Custom domain에 방금 산 주소(예:{" "}
                <span className="font-mono text-xs">mycalc.com</span>)를 넣고
                Save 합니다.
              </p>
              <p>
                3. 가비아 마이페이지의 DNS 관리에서 아래 표 값을 추가합니다.
              </p>
              <p>
                4. GitHub의 DNS check가 통과하면 Enforce HTTPS를 켭니다.
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
            하위 도메인만 쓸 경우(예: calc.example.com)에는 A 레코드 대신 CNAME
            하나만 있으면 됩니다. 호스트는{" "}
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
            href="https://www.gabia.com/"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            가비아에서 검색
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
