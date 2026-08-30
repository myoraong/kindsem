import { POLICY_FETCHED_AT, POLICY_SOURCES } from "@/lib/policy.generated"

/** 법제처 Open API를 마지막으로 받은 날짜. 빌드·cron이 자동으로 갱신합니다. */
export const LAW_CHECKED_ON = POLICY_FETCHED_AT

function fromPolicy(
  key: keyof typeof POLICY_SOURCES,
  title: string,
  href: string,
  note: string,
) {
  const s = POLICY_SOURCES[key]
  return { title, effective: s.enforced, href, note }
}

export const LAW_SOURCES = {
  brokerage: fromPolicy(
    "brokerage",
    "공인중개사법 시행규칙 제20조·별표 1·별표 2",
    "https://www.law.go.kr/법령/공인중개사법 시행규칙",
    "상한요율은 2021.10.19. 별표가 그대로입니다. 2026.8.11. 개정은 업무정지 기준입니다.",
  ),
  acquisition: fromPolicy(
    "local",
    "지방세법 제11조·제13조의2·제151조",
    "https://www.law.go.kr/법령/지방세법",
    "중과기준세율은 1천분의 20입니다. 8%는 4%+2%×200, 12%는 4%+2%×400입니다.",
  ),
  firstHome: fromPolicy(
    "firstHome",
    "지방세특례제한법 제36조의3",
    "https://www.law.go.kr/법령/지방세특례제한법",
    "12억 원 이하, 2028.12.31.까지. 일반 200만 원, 인구감소지역 등은 300만 원.",
  ),
  stamp: fromPolicy(
    "stamp",
    "인지세법 제3조·제6조",
    "https://www.law.go.kr/법령/인지세법",
    "주택 소유권이전 증서는 기재금액 1억 원 이하 비과세입니다.",
  ),
  rural: fromPolicy(
    "rural",
    "농어촌특별세법 제5조",
    "https://www.law.go.kr/법령/농어촌특별세법",
    "전용 85㎡ 초과 주택에 일반 0.2%, 중과 8%는 0.6%, 12%는 1.0%를 씁니다.",
  ),
  income: fromPolicy(
    "income",
    "소득세법 제55조·제89조·제95조·제104조",
    "https://www.law.go.kr/법령/소득세법",
    "1세대1주택 비과세 12억, 단기 70·60%, 다주택 중과는 2026.5.10. 이후 양도분입니다.",
  ),
  gift: fromPolicy(
    "gift",
    "상속세 및 증여세법 제26조·제53조",
    "https://www.law.go.kr/법령/상속세 및 증여세법",
    "10년 합산 공제 한도입니다. 세대생략 할증은 넣지 않았습니다.",
  ),
  holding: fromPolicy(
    "holding",
    "지방세법 제111조·종합부동산세법 제8조·제9조",
    "https://www.law.go.kr/법령/종합부동산세법",
    "공정시장가액비율 60%, 1주택 공제 12억입니다. 세부담상한·특례주택은 빼 두었습니다.",
  ),
  license: fromPolicy(
    "local",
    "지방세법 제28조",
    "https://www.law.go.kr/법령/지방세법",
    "상속 등기 0.8%, 증여 등기 1.5%입니다. 매매 등록세는 취득세에 포함됩니다.",
  ),
  corp: fromPolicy(
    "corp",
    "법인세법 제55조",
    "https://www.law.go.kr/법령/법인세법",
    "토지등 양도소득 추가과세는 비사업용토지 10%만 단순 반영합니다.",
  ),
  laborHoliday: fromPolicy(
    "laborStd",
    "근로기준법 제18조·제50조·제55조, 최저임금법 시행령 제5조",
    "https://www.law.go.kr/법령/근로기준법",
    "주 15시간 미만은 주휴 미적용. 주휴시간 = 1일 근로시간×(주소정/주 법정시간).",
  ),
  laborLeave: fromPolicy(
    "laborStd",
    "근로기준법 제60조",
    "https://www.law.go.kr/법령/근로기준법",
    "1년 15일, 3년 이상 매 2년 1일 가산, 한도 25일. 단시간은 비례.",
  ),
  severance: fromPolicy(
    "severanceLaw",
    "근로자퇴직급여 보장법 제4조·제8조, 근로기준법 제2조",
    "https://www.law.go.kr/법령/근로자퇴직급여 보장법",
    "평균임금 30일분×근속연수. 1년 미만은 적용 제외.",
  ),
  rentConvert: {
    title: "주택임대차보호법 제7조의2, 시행령 제9조",
    href: "https://www.law.go.kr/법령/주택임대차보호법 시행령",
    effective: "현행",
    note: "상한은 연 10%와 한국은행 기준금리+2%p 중 낮은 비율. 기준금리는 직접 입력.",
  },
  vehicle: fromPolicy(
    "local",
    "지방세법 제12조 제1항 제2호·제151조 제1항 제1호",
    "https://www.law.go.kr/법령/지방세법",
    "비영업 승용 7%, 경형 4%, 그 밖의 비영업 5%, 영업용 4%. 교육세는 (세율-2%)×20%.",
  ),
  compactCar: fromPolicy(
    "firstHome",
    "지방세특례제한법 제67조",
    "https://www.law.go.kr/법령/지방세특례제한법",
    "비영업 경형 승용 취득세 75만 원 한도 감면. 2027.12.31.까지.",
  ),
  laborOvertime: fromPolicy(
    "laborStd",
    "근로기준법 제56조",
    "https://www.law.go.kr/법령/근로기준법",
    "연장 50% 가산, 야간(22:00–06:00) 50% 가산, 휴일 8시간 이내 50%·초과 100% 가산.",
  ),
  parentalLeave: fromPolicy(
    "eiLeaveDecree",
    "고용보험법 시행령 제95조·제95조의3",
    "https://www.law.go.kr/법령/고용보험법 시행령",
    "일반 1~3개월 100% 상한 250만, 4~6개월 200만, 7개월부터 80% 160만. 하한 70만.",
  ),
  importDuty: fromPolicy(
    "expressNotice",
    "관세법 시행규칙 제45조, 특송물품 수입통관 사무처리에 관한 고시, 부가가치세법 제20조·제30조",
    "https://www.law.go.kr/법령/관세법",
    "목록통관 미화 150달러(미국발 200달러). 수입신고 소액면세 150달러. 부가세 10%는 관세가 정해진 뒤.",
  ),
  importDeMinimis: fromPolicy(
    "customsRule",
    "관세법 시행규칙 제45조",
    "https://www.law.go.kr/법령/관세법 시행규칙",
    "자가사용 소액물품 면세 미화 150달러.",
  ),
  carTax: fromPolicy(
    "local",
    "지방세법 제127조·제151조 제1항 제7호",
    "https://www.law.go.kr/법령/지방세법",
    "비영업 승용 cc당 80·140·200원. 차령 3년차부터 5%씩, 12년 50%. 전기 등 비영업 10만 원. 교육세 30%.",
  ),
  interest: fromPolicy(
    "income",
    "소득세법 제129조 제1항 제1호, 지방세법 제103조의13",
    "https://www.law.go.kr/법령/소득세법",
    "이자소득 원천징수 14%, 지방소득세 그 10%(1.4%). 합계 15.4%.",
  ),
  rentCredit: fromPolicy(
    "specialTax",
    "조세특례제한법 제95조의2",
    "https://www.law.go.kr/법령/조세특례제한법",
    "무주택, 총급여 8천 이하, 월세 연 1천만 한도. 15%, 총급여 5,500만 이하 17%. 세제개편안은 아직 법이 아님.",
  ),
} as const
