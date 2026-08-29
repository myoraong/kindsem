# 계산기 (DeskCalc)

브라우저에서 바로 쓰는 계산기입니다. 사칙연산, 메모리, 계산 기록, 키보드 입력을 지원합니다. GitHub Pages 배포와 도메인 확정 뼈대가 들어 있습니다.

도메인을 사면 사이트 **도메인 확정**(`/connect/`)에 주소를 넣고, 나온 명령을 실행하면 그 주소로 고정됩니다.

## 로컬에서 실행

미리보기는 **정적 `out/` 서버**를 씁니다. Cursor에서 Preview가 Start로 바뀌면 `npm start`가 이 서버를 켭니다. `next dev`는 미리보기에서 막히므로 쓰지 마세요.

```bash
npm install
npm run build
npm run preview:serve
```

브라우저에서 [http://127.0.0.1:43127](http://127.0.0.1:43127) 을 엽니다.

이미 떠 있는지는 바로 확인합니다. 200이면 재시작·빌드하지 않습니다.

```bash
npm run preview:check
npm run preview
```

소스를 바꾼 뒤에만 다시 빌드합니다.

```bash
npm test
npm run build
npm run preview:restart
```

## 도메인 확정

Cloudflare에서 산 뒤:

```bash
npm run set-domain -- mycalc.com
```

이 명령이 `public/CNAME`과 `src/lib/site-domain.ts`에 주소를 씁니다. 커밋하고 `main`에 푸시하세요.

그다음:

1. Cursor에서 **Create repo**로 GitHub 저장소를 만듭니다. 아직 GitHub 저장소가 아닙니다.
2. 저장소 Settings → Pages에서 Source를 **GitHub Actions**로 둡니다.
3. Custom domain에 같은 주소를 넣습니다.
4. Cloudflare DNS에 사이트 **도메인 확정** 페이지가 보여 주는 레코드를 넣고, Proxy는 **DNS only**로 둡니다.
5. GitHub에서 Enforce HTTPS를 켭니다.

사는 순서는 `/guide/` 또는 아래를 보세요.

## 도메인 사는 법 (Cloudflare)

`.kr` 과 한글 도메인은 Cloudflare에서 살 수 없으니 `.com` 을 고르세요.

1. [Cloudflare 가입](https://dash.cloudflare.com/sign-up) 후 이메일을 인증합니다.
2. [Register domains](https://dash.cloudflare.com/?to=/:account/domains/register)에서 `mycalc.com` 을 검색합니다.
3. **Purchase** → 기간 1년. 연락처는 영문(로마자)만 됩니다.
4. 국내 카드는 해외 결제를 켠 뒤 **Complete purchase**. 안 되면 PayPal.
5. ICANN 이메일 인증 메일의 링크를 반드시 누릅니다.

## 계산기 기능

- 더하기, 빼기, 곱하기, 나누기
- 등호를 다시 누르면 마지막 연산을 반복
- `%`, 부호 전환, 현재 값 지우기 / 전체 지우기
- 메모리 `MC` `MR` `M+` `M−`
- 계산 기록(이 브라우저 localStorage)
- 키보드: 숫자, `+ - * /`, Enter, Esc, Backspace
