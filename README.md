# 계산기 (DeskCalc)

브라우저에서 바로 쓰는 계산기입니다. 사칙연산, 메모리, 계산 기록, 키보드 입력을 지원하고, GitHub Pages에 올린 뒤 구매한 도메인을 붙일 수 있게 설정해 두었습니다.

도메인 결제 자체는 등록 기관 계정에서만 할 수 있습니다. 사이트 안 **도메인 연결** 페이지에 클릭 순서와 DNS 값을 적어 두었습니다.

## 로컬에서 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://127.0.0.1:43127](http://127.0.0.1:43127) 을 엽니다.

```bash
npm test
npm run build
```

`npm run build` 결과는 `out/` 폴더의 정적 파일입니다. GitHub Pages는 이 폴더를 배포합니다.

## 도메인 사는 법

도메인은 사이트 주소입니다. 1년 단위로 빌려 쓰며, 결제는 등록 기관에서만 할 수 있습니다.

1. 짧은 영문 이름을 정합니다. 예: `mycalc`
2. 처음이면 확장자는 `.com` (또는 `.kr`)
3. [가비아](https://www.gabia.com/)에 가입하고 검색창에 이름을 넣습니다. 영어가 되고 가격을 낮추려면 [Cloudflare](https://dash.cloudflare.com/)도 됩니다.
4. **등록 가능**인 주소를 장바구니에 담습니다. 웹호스팅, 메일, SSL은 빼세요. 도메인만 사면 됩니다.
5. 1년 기간, 실제 받을 수 있는 이메일·전화로 결제합니다.
6. 마이페이지 도메인 목록에 주소가 보이면 구매가 끝난 것입니다.

그다음 GitHub Pages와 DNS 연결은 아래와 사이트 **도메인 사는 법** 페이지를 보세요.

## GitHub에 올리고 도메인 연결

1. Cursor에서 **Create repo**로 GitHub 저장소를 만듭니다. 이 작업 공간은 아직 GitHub 저장소가 아닙니다.
2. 저장소 **Settings → Pages**에서 Source를 **GitHub Actions**로 선택합니다.
3. Cloudflare, 가비아, 후이즈 등에서 도메인을 구매합니다.
4. DNS에 GitHub Pages 주소를 넣습니다.

루트 도메인(`example.com`) A 레코드:

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

www CNAME 값은 `yourname.github.io` 입니다. GitHub 아이디로 바꾸세요.

하위 도메인만 쓸 경우(예: `calc.example.com`)에는 CNAME 하나만 있으면 됩니다. 호스트 `calc`, 값 `yourname.github.io`.

5. Pages 설정의 Custom domain에 구매한 주소를 저장하고, DNS check가 통과하면 Enforce HTTPS를 켭니다.
6. 저장소에 `public/CNAME` 파일을 만들고 도메인만 한 줄 적습니다.

```
calc.example.com
```

커밋 후 `main`에 푸시하면 `.github/workflows/deploy-pages.yml`이 사이트를 다시 배포합니다.

사용자 지정 도메인을 쓰면 `NEXT_PUBLIC_BASE_PATH`는 비워 두면 됩니다. `https://yourname.github.io/저장소이름/` 으로만 열 때는 워크플로의 `NEXT_PUBLIC_BASE_PATH`를 `/저장소이름`으로 바꾸세요.

자세한 화면 안내는 배포된 사이트의 `/guide/` 또는 [GitHub Pages 사용자 지정 도메인 문서](https://docs.github.com/ko/pages/configuring-a-custom-domain-for-your-github-pages-site)를 보세요.

## 계산기 기능

- 더하기, 빼기, 곱하기, 나누기
- 등호를 다시 누르면 마지막 연산을 반복
- `%`, 부호 전환, 현재 값 지우기 / 전체 지우기
- 메모리 `MC` `MR` `M+` `M−`
- 계산 기록(이 브라우저 localStorage)
- 키보드: 숫자, `+ - * /`, Enter, Esc, Backspace
