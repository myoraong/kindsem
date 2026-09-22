export const MASCOT = {
  name: "세나",
  meaning: "내가 세어 줄게요",
  alt: "세나, 카인드셈 마스코트. 크림색 곰이 세이지 계산기와 영수증을 들고 있습니다.",
  altCalc:
    "세나, 카인드셈 마스코트. 크림색 곰이 세이지 계산기 버튼을 누르며 세고 있습니다.",
} as const

/** 검색·카카오·X 미리보기에 쓰는 지금 세나. 예전 캐시와 주소를 갈라 둡니다. */
export const MASCOT_SHARE = {
  src: "/kindsem-sena-share-live.png",
  width: 1200,
  height: 1200,
} as const

/** 사이트 안 동그란 자리의 세나 얼굴. 검색 작은 아이콘은 전신이다. */
export const MASCOT_MARK = {
  src: "/kindsem-sena-face-live.png",
  width: 512,
  height: 512,
} as const

export const MASCOT_FAVICON = {
  png48: "/kindsem-sena-face-fav-48.png",
  png96: "/kindsem-sena-face-fav-96.png",
  png192: "/kindsem-sena-face-fav-192.png",
  png512: "/kindsem-sena-favicon-512.png",
  ico: "/favicon.ico",
} as const
