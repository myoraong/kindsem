# Kindsem · 카인드셈

친절한 생활 계산 사이트입니다. Kind(친절)와 셈(계산)을 붙인 이름으로, 세법 백과사전 대신 살 때·빌릴 때·오늘 필요한 숫자만 따뜻하게 보여 줍니다.

공개 주소는 [https://kindsem.com](https://kindsem.com) 입니다. GitHub Pages로 정적 사이트를 올립니다.

## 테마

따뜻한 크림 종이 위에 부드러운 세이지 그린입니다. 눈 편한 색감으로, 이름처럼 부담 없이 쓰도록 맞췄습니다. 마스코트 **세나**는 셈과 나(내가 세어 줄게요)를 붙인 이름으로, 부르기 쉽게 맞춰 두었습니다.

## 계산기

**오늘 쓰는** 바로 계산, 더치페이, 할인·부가세

**빌릴 때** 중개수수료, 자취 초기비용, 전세대출 이자

**살 때** 취득세, 살 때 총비용, 주택담보대출, 임대수익률

중개수수료·취득세·인지세는 법제처 현행 법령을 조회해 반영했습니다. 세액은 추정치입니다.

## 숫자 자동 갱신

채팅으로 24시간 법령을 지켜볼 수는 없어서, 법제처·금융위 현행본에서 계산에 쓰는 숫자를 읽어 넣습니다.

- `npm run refresh-policy` / `npm run build` 때마다 소득·법인·상속증여 세율, 증여공제, 중개보수 별표, 인지세, 취득세 중과, 부가세, 재산세 구간, 종부세 공제, LTV·은행 DSR을 다시 받습니다.
- GitHub Actions가 매일 09시·21시(한국 시간, UTC 0시·12시)에 같은 작업을 돌리고, 숫자가 바뀌면 커밋한 뒤 kindsem.com에 바로 올립니다.

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

## kindsem.com 배포

`main`에 푸시하면 GitHub Actions가 `out/`을 만들어 GitHub Pages에 올립니다. 저장소 Settings → Pages의 Source는 **GitHub Actions**, Custom domain은 `kindsem.com` 입니다. Cloudflare DNS는 GitHub Pages 주소로, Proxy는 DNS only입니다.
