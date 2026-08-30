/** 법제처 Open API(OC=test)로 2026-08-29 조회한 현행 기준 */
export const LAW_CHECKED_ON = "2026-08-29"

export const LAW_SOURCES = {
  brokerage: {
    title: "공인중개사법 시행규칙 제20조·별표 1·별표 2",
    effective: "2026-08-28",
    href: "https://www.law.go.kr/법령/공인중개사법 시행규칙",
    note: "상한요율은 2021.10.19. 별표가 그대로입니다. 2026.8.11. 개정은 업무정지 기준입니다.",
  },
  acquisition: {
    title: "지방세법 제11조·제13조의2·제151조",
    effective: "2026-01-01",
    href: "https://www.law.go.kr/법령/지방세법",
    note: "중과기준세율은 1천분의 20입니다. 8%는 4%+2%×200, 12%는 4%+2%×400입니다.",
  },
  firstHome: {
    title: "지방세특례제한법 제36조의3",
    effective: "2026-06-02",
    href: "https://www.law.go.kr/법령/지방세특례제한법",
    note: "12억 원 이하, 2028.12.31.까지. 일반 200만 원, 인구감소지역 등은 300만 원.",
  },
  stamp: {
    title: "인지세법 제3조·제6조",
    effective: "2026-01-02",
    href: "https://www.law.go.kr/법령/인지세법",
    note: "주택 소유권이전 증서는 기재금액 1억 원 이하 비과세입니다.",
  },
  rural: {
    title: "농어촌특별세법 제5조",
    effective: "2026-05-12",
    href: "https://www.law.go.kr/법령/농어촌특별세법",
    note: "전용 85㎡ 초과 주택에 일반 0.2%, 중과 8%는 0.6%, 12%는 1.0%를 씁니다.",
  },
} as const
