# Kindsem · 카인드셈

친절한 생활 계산 사이트입니다. Kind(친절)와 셈(계산)을 붙인 이름으로, 세법 백과사전 대신 생활·급여·부동산에 필요한 숫자만 따뜻하게 보여 줍니다.

공개 주소는 [https://kindsem.com](https://kindsem.com) 입니다. GitHub Pages로 정적 사이트를 올립니다.

## 테마

따뜻한 크림 종이 위에 부드러운 세이지 그린입니다. 눈 편한 색감으로, 이름처럼 부담 없이 쓰도록 맞췄습니다. 마스코트 **세나**는 셈과 나(내가 세어 줄게요)를 붙인 이름으로, 부르기 쉽게 맞춰 두었습니다.

## 계산기

**생활** 바로 계산, 더치페이, 사다리타기, 할인·부가세, 자동차 취득세, 자동차세, 해외직구 관세·부가세, 예적금

**급여** 실수령, 주휴수당, 알바 월급, 월급 일할, 연장·야간·휴일 수당, 연차 일수·수당, 퇴직금, 육아휴직 급여, 연봉 vs 이직 제안, 알바 3.3% vs 종소세, 지원금, 자격

**빌릴 때** 중개수수료, 이사 총액, 전세대출 이자, 전월세 전환율, 전세 vs 월세, 월세 세액공제

**살 때** 취득세, 살 때 총비용, 주택담보대출, 임대수익률

중개수수료·취득세·인지세는 법제처 현행 법령을 조회해 반영했습니다. 세율·상한은 법령·고시입니다.

## 숫자 자동 갱신

채팅으로 24시간 법령을 지켜볼 수는 없어서, 법제처·금융위 현행본에서 계산에 쓰는 숫자를 읽어 넣습니다.

- `npm run refresh-policy` / `npm run build` 때마다 소득·법인·상속증여 세율, 증여공제, 중개보수 별표, 인지세, 취득세 중과, 부가세, 재산세 구간, 종부세 공제, LTV·은행 DSR, 4대보험 고시, 주휴·연차 시간, 자동차세, 월세 세액공제, 자동차 취득세·경형 감면, 연장·야간·휴일 가산, 이자·사업소득 원천징수, 식사대·기본공제·근로소득공제 한도, 청년 중소기업 감면, 육아휴직 급여, 목록통관·소액면세, 퇴직금 일수를 다시 받습니다.
- GitHub Actions가 매일 09시·21시(한국 시간, UTC 0시·12시)에 같은 작업을 돌리고, 숫자가 바뀌면 커밋한 뒤 kindsem.com에 바로 올립니다. 따로 물어보지 않습니다.
- 법령 표 모양이 바뀌어 읽기가 실패하면 이 에이전트가 파서를 고친 뒤 다시 받습니다. 타이머는 돌 때마다 다시 걸어 만료되지 않게 합니다.
- 계산기 하단에 마지막 조회일이 보이고, 주요 법령 시행일이 달라지면 알려 줍니다.

별표에 없는 수도권 주담대 절대한도·스트레스 DSR 가산·법무사 시세는 계산에 넣지 않습니다. 빠진 공제·사실관계가 있으면 결과가 달라집니다.

## 로컬에서 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://127.0.0.1:43217](http://127.0.0.1:43217) 을 엽니다.

정적 사이트(GitHub Pages와 동일)로 확인하려면:

```bash
npm run build
```

`out/` 폴더가 배포본입니다.

## Google AdSense

승인을 보장하지는 않습니다. 가입·심사는 Google 쪽 절차입니다.

1. [adsense.google.com](https://adsense.google.com)에서 Google 계정으로 가입합니다. 사이트 주소는 `https://kindsem.com`, 언어는 한국어, 연락처는 운영 이메일입니다.
2. 사이트 소유 확인은 보통 헤드의 `ca-pub-` 스크립트 또는 루트 `ads.txt`입니다. `NEXT_PUBLIC_ADSENSE_CLIENT`를 넣으면 레이아웃에 스크립트가 붙고, `public/ads.txt`에 Google이 준 한 줄을 넣으면 됩니다.
3. 심사에는 개인정보 안내(`/privacy`), 문의(`/contact`), 실제 계산 본문이 있어야 합니다. 빈 사이트나 클릭 유도는 거절됩니다.
4. 승인 후 자동 광고 또는 광고 단위를 켜고, `https://kindsem.com/ads.txt`를 유지합니다.
5. 부정 클릭은 금지입니다. 콘텐츠 정책은 [AdSense 프로그램 정책](https://support.google.com/adsense/answer/9724)을 따릅니다.

게시자 ID를 받기 전에는 광고 스크립트를 넣지 않습니다. 가짜 `pub-XXXXXXXX` 줄도 올리지 않습니다.

승인 후:

- `.env.local`에 `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-…` 와 `NEXT_PUBLIC_ADSENSE_PUB=pub-…` 를 넣고 다시 빌드하거나,
- `public/ads.txt`에 `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` 한 줄을 직접 붙여 넣습니다.

`.env.example`에 빈 칸이 있습니다. kindsem.com 빌드는 GitHub Actions이므로, 라이브에 스크립트를 붙이려면 저장소 Secrets에 같은 이름을 넣고 배포해야 합니다.

## kindsem.com 배포

공개 사이트는 [github.com/myoraong/kindsem](https://github.com/myoraong/kindsem) 입니다. Origin `main` 히스토리를 GitHub에 덮어쓰지 않고, `npm run sync-live` 가 사이트 파일을 라이브 클론에 복사한 뒤 푸시합니다. GitHub Actions가 `out/`을 만들어 GitHub Pages에 올립니다. 세율 자동 갱신이 숫자를 바꾸면 같은 경로로 kindsem.com에 바로 반영됩니다. 저장소 Settings → Pages의 Source는 **GitHub Actions**, Custom domain은 `kindsem.com` 입니다. Cloudflare DNS는 GitHub Pages 주소로, Proxy는 DNS only입니다.
