import assert from "node:assert/strict"
import test from "node:test"
import {
  extractProgressive,
  exitCodeForRefreshFailure,
  getJson,
  isTransientFetchError,
  parseGiftDeductions,
  parseKoreanWon,
  TransientFetchError,
} from "./refresh-policy.mjs"
import {
  parseBrokerageHouse,
  parseLtvFromBanking,
  parseStampBands,
  parseVatRate,
  parseLawWon,
  parseRentCredit,
  parseCarTax,
  parseLaborHours,
  parsePensionBase,
  parsePensionEmployeeRate,
  parseHealthWorkplaceRate,
  parseLongTermCareRate,
  parseEmploymentUnempRate,
  parseHealthCapNotice,
  parseVehicleAcquisition,
  parseVehicleEducation,
  parseCompactRelief,
  parseOvertime,
  parseInterestNationalRate,
  parseLocalWithholdingShare,
  parseBizWithholding,
  parseMealExempt,
  parseYouthRelief,
  parseBasicPersonDeduction,
  parseEarnedDeductionCap,
  parseSeveranceDays,
  parseDeMinimisUsd,
  parseListClearance,
  parseParentalLeave,
} from "./policy-fields.mjs"

const INCOME_GRID = `┌────────┬──────────────────────────┐│1,400만원 이하  │과세표준의 6퍼센트                                  │├────────┼──────────────────────────┤│1,400만원 초과  │84만원 + (1,400만원을 초과하는 금액의 15퍼센트)     ││5,000만원 이하  │                                                    │├────────┼──────────────────────────┤│5,000만원 초과  │624만원 + (5,000만원을 초과하는 금액의 24퍼센트)    ││8,800만원 이하  │                                                    │├────────┼──────────────────────────┤│8,800만원 초과  │1,536만원 + (8,800만원을 초과하는 금액의 35퍼센트)  ││1억5천만원 이하 │                                                    │└────────┴──────────────────────────┘`

test("parseKoreanWon reads mixed 억·천만 amounts", () => {
  assert.equal(parseKoreanWon("1,400만원"), 14_000_000)
  assert.equal(parseKoreanWon("1억5천만원"), 150_000_000)
  assert.equal(parseKoreanWon("6억원"), 600_000_000)
  assert.equal(parseKoreanWon("5천만원. 다만, 미성년자는 2천만원"), 50_000_000)
})

test("extractProgressive reads 소득세법 제55조 표", () => {
  const rows = extractProgressive(INCOME_GRID)
  assert.equal(rows.length, 4)
  assert.deepEqual(
    rows.map((row) => [row.upTo, row.rate, row.deduction]),
    [
      [14_000_000, 0.06, 0],
      [50_000_000, 0.15, 1_260_000],
      [88_000_000, 0.24, 5_760_000],
      [150_000_000, 0.35, 15_440_000],
    ],
  )
})

test("parseGiftDeductions reads 제53조 호", () => {
  const unit = {
    항: {
      호: [
        { 호내용: "1. 배우자로부터 증여를 받은 경우: 6억원" },
        {
          호내용:
            "2. 직계존속[수증자의 직계존속과 혼인(사실혼은 제외한다. 이하 이 조에서 같다) 중인 배우자를 포함한다. 이하 제53조의2에서 같다]으로부터 증여를 받은 경우: 5천만원. 다만, 미성년자가 직계존속으로부터 증여를 받은 경우에는 2천만원으로 한다.",
        },
        {
          호내용:
            "3. 직계비속(수증자와 혼인 중인 배우자의 직계비속을 포함한다)으로부터 증여를 받은 경우: 5천만원",
        },
        {
          호내용:
            "4. 제2호 및 제3호의 경우 외에 4촌 이내의 혈족, 3촌 이내의 인척으로부터 증여를 받은 경우: 1천만원",
        },
      ],
    },
  }
  assert.deepEqual(parseGiftDeductions(unit), {
    spouse: 600_000_000,
    ascendant: 50_000_000,
    descendant: 50_000_000,
    other: 10_000_000,
  })
})

test("parseVatRate reads 부가가치세법 제30조", () => {
  assert.equal(parseVatRate("제30조(세율) 부가가치세의 세율은 10퍼센트로 한다."), 0.1)
})

test("parseBrokerageHouse reads 별표 1", () => {
  const text =
    "주택 중개보수 상한요율│매매ㆍ교환│5천만원 미만│1천분의 6│25만원│5천만원 이상 2억원 미만│1천분의 5│80만원│2억원 이상 9억원 미만│1천분의 4││15억원 이상│1천분의 7│2. 임대차 등│5천만원 미만│1천분의 5│20만원│5천만원 이상 1억원 미만│1천분의 4│30만원│15억원 이상│1천분의 6"
  const { sale, lease } = parseBrokerageHouse(text)
  assert.equal(sale[0].rate, 0.006)
  assert.equal(sale[0].max, 50_000_000)
  assert.equal(sale[0].cap, 250_000)
  assert.equal(sale[sale.length - 1].rate, 0.007)
  assert.equal(lease[0].rate, 0.005)
  assert.equal(lease[0].cap, 200_000)
})

test("parseStampBands reads 인지세 표", () => {
  const text =
    "기재금액이 1천만원 초과 3천만원 이하인 경우:2만원 기재금액이 3천만원 초과 5천만원 이하인 경우:4만원 기재금액이 10억원을 초과하는 경우:35만원"
  const rows = parseStampBands(text)
  assert.equal(rows[0].upTo, 30_000_000)
  assert.equal(rows[0].duty, 20_000)
  assert.equal(rows[rows.length - 1].duty, 350_000)
})

test("parseLtvFromBanking reads 별표 6", () => {
  const text =
    "은행은 신규 주택담보대출 취급시 담보인정비율을 70%(규제지역의 경우 50%) 이내에서 취급하여야 한다. 생애최초주택구매자의 주택구입 목적 주택담보대출의 경우에는 담보인정비율을 80% 이내에서 취급할 수 있다. 다만, 이 경우 주택담보대출금액은 6억원을 초과할 수 없다. 총부채원리금상환비율이 40%를 초과하지 않는 범위 내에서 취급해야 한다."
  const ltv = parseLtvFromBanking(text)
  assert.equal(ltv.unregulated, 0.7)
  assert.equal(ltv.regulated, 0.5)
  assert.equal(ltv.firstTime, 0.8)
  assert.equal(ltv.firstTimeCap, 600_000_000)
  assert.equal(ltv.dsrBank, 0.4)
})

test("월세 세액공제·자동차세·4대보험 표기를 읽는다", () => {
  assert.equal(parseLawWon("8천만원"), 80_000_000)
  assert.equal(parseLawWon("5천500만원"), 55_000_000)
  assert.equal(parseLawWon("410천원"), 410_000)
  assert.equal(parseLawWon("6,590천원"), 6_590_000)

  const rent = parseRentCredit(
    "총급여액이 8천만원 이하인 근로소득이 있는 근로자(해당 과세기간에 종합소득과세표준을 계산할 때 합산하는 종합소득금액이 7천만원을 초과하는 사람은 제외한다)가 대통령령으로 정하는 주택을 임차하기 위하여 대통령령으로 정하는 월세액을 지급하는 경우 그 금액의 100분의 15[해당 과세기간의 총급여액이 5천500만원 이하인 근로소득이 있는 근로자(해당 과세기간에 종합소득과세표준을 계산할 때 합산하는 종합소득금액이 4천500만원을 초과하는 사람은 제외한다)의 경우에는 100분의 17]에 해당하는 금액을 해당 과세기간의 종합소득산출세액에서 공제한다. 다만, 해당 월세액이 1천만원을 초과하는 경우 그 초과하는 금액은 없는 것으로 한다.",
  )
  assert.equal(rent?.salaryCap, 80_000_000)
  assert.equal(rent?.rate, 0.15)
  assert.equal(rent?.rateLow, 0.17)
  assert.equal(rent?.rentCap, 10_000_000)

  const car = parseCarTax(
    "1,000시시 이하│18원        │1,000시시 이하│80원 1,600시시 이하│18원        │1,600시시 이하│140원 2,000시시 이하│19원 1,600시시 초과│200원 2,500시시 이하│19원 2,500시시 초과│24원 그 밖의 승용자동차 20,000원│100,000원",
  )
  assert.equal(car?.private[0].perCc, 80)
  assert.equal(car?.private[2].perCc, 200)
  assert.equal(car?.commercial[4].perCc, 24)
  assert.equal(car?.evPrivate, 100_000)

  const labor = parseLaborHours(
    "4주 동안을 평균하여 1주 동안의 소정근로시간이 15시간 미만인 근로자에 대하여는 제55조와 제60조를 적용하지 아니한다.",
    "① 1주 간의 근로시간은 휴게시간을 제외하고 40시간을 초과할 수 없다. ② 1일의 근로시간은 휴게시간을 제외하고 8시간을 초과할 수 없다.",
    "① 사용자는 1년간 80퍼센트 이상 출근한 근로자에게 15일의 유급휴가를 주어야 한다. 가산휴가를 포함한 총 휴가 일수는 25일을 한도로 한다.",
  )
  assert.equal(labor?.weeklyFullHours, 40)
  assert.equal(labor?.dailyHours, 8)
  assert.equal(labor?.shortHourThreshold, 15)
  assert.equal(labor?.annualLeaveCap, 25)

  const pension = parsePensionBase("1. 국민연금 기준소득월액  가. 하한액 : 410천원  나. 상한액 : 6,590천원")
  assert.equal(pension?.floor, 410_000)
  assert.equal(pension?.ceil, 6_590_000)
  assert.equal(parsePensionEmployeeRate("2026년은 1만분의 475", 2026), 0.0475)
  assert.equal(parseHealthWorkplaceRate("직장가입자의 보험료율 및 같은 조 제3항에 따른 지역가입자의 보험료율은 각각 1만분의 719로 한다."), 0.0719)
  assert.equal(parseLongTermCareRate("장기요양보험료율은 100만분의 9,448로 한다."), 0.009448)
  assert.equal(parseEmploymentUnempRate("2. 실업급여의 보험료율: 1천분의 18"), 0.018)

  const cap = parseHealthCapNotice(
    "제2조(월별 보험료액의 상한) 1. 직장가입자의 보수월액보험료 : 9,183,480원 제3조(월별 보험료액의 하한) 1. 직장가입자의 보수월액보험료 : 20,160원",
  )
  assert.equal(cap?.totalCap, 9_183_480)
  assert.equal(cap?.floor, 20_160)
})

test("취득세·연장수당·이자·육아·관세·급여공제 표기를 읽는다", () => {
  const vehicle = parseVehicleAcquisition(
    "비영업용 승용자동차: 1천분의 70 경자동차: 1천분의 40 그 밖의 자동차 비영업용: 1천분의 50 영업용: 1천분의 40",
  )
  assert.equal(vehicle?.passenger, 0.07)
  assert.equal(vehicle?.compact, 0.04)
  assert.equal(vehicle?.otherPrivate, 0.05)
  assert.equal(vehicle?.commercial, 0.04)

  const education = parseVehicleEducation(
    "제11조부터 제15조까지의 세율에서 중과기준세율 또는 제1항의 중과세율과 1천분의 20을 뺀 세율로 산출한 금액)의 100분의 20",
  )
  assert.equal(education?.offset, 0.02)
  assert.equal(education?.share, 0.2)

  const compact = parseCompactRelief(
    "취득세액이 75만원 이하인 경우 취득세를 면제하고, 2027년 12월 31일까지 감면한다.",
  )
  assert.equal(compact?.relief, 750_000)
  assert.equal(compact?.until, "2027-12-31")

  const overtime = parseOvertime(
    "연장근로에 대하여는 통상임금의 100분의 50 이상을 가산하여 지급하여야 한다. 8시간 이내의 휴일근로: 통상임금의 100분의 50 8시간을 초과한 휴일근로: 통상임금의 100분의 100 야간근로에 대하여는 통상임금의 100분의 50 이상을 가산한다.",
  )
  assert.equal(overtime?.overtimePremium, 0.5)
  assert.equal(overtime?.holidayPremium, 0.5)
  assert.equal(overtime?.holidayOverPremium, 1)
  assert.equal(overtime?.nightPremium, 0.5)
  assert.equal(overtime?.holidaySplitHours, 8)

  assert.equal(parseInterestNationalRate("그 밖의 이자소득에 대해서는 100분의 14"), 0.14)
  assert.equal(
    parseLocalWithholdingShare(
      "원천징수하는 소득세의 100분의 10에 해당하는 금액을 소득세 원천징수와 동시에 개인지방소득세로 징수하여야 한다.",
    ),
    0.1,
  )
  assert.equal(parseBizWithholding("원천징수대상 사업소득에 대해서는 100분의 3"), 0.03)
  assert.equal(parseMealExempt("월 20만원 이하의 식사대"), 200_000)

  const youth = parseYouthRelief("청년의 경우에는 100분의 90 과세기간별로 200만원을 한도로 한다.")
  assert.equal(youth?.rate, 0.9)
  assert.equal(youth?.cap, 2_000_000)
  assert.equal(parseBasicPersonDeduction("1명당 연 150만원을 곱하여 계산한 금액을 종합소득금액에서 공제한다."), 1_500_000)
  assert.equal(parseEarnedDeductionCap("다만, 공제액이 2천만원을 초과하는 경우에는 2천만원을 공제한다."), 20_000_000)
  assert.equal(parseSeveranceDays("계속근로기간 1년에 대하여 30일분 이상의 평균임금을 퇴직금으로 지급하여야 한다."), 30)
  assert.equal(
    parseDeMinimisUsd("미화 150달러 이하의 물품으로서 자가사용으로 인정되는 것"),
    150,
  )

  const list = parseListClearance(
    '미화 150달러(대한민국과 미합중국 간의 자유무역협정에 따른 물품인 경우에는 미화 200달러) 이하에 해당하는 물품(이하 "목록통관대상물품"이라 한다)',
  )
  assert.equal(list?.listUsd, 150)
  assert.equal(list?.listUsUsd, 200)

  const parental = parseParentalLeave(
    "그 금액이 월 70만원보다 적은 경우에는 월 70만원으로 하고, 상한액을 넘는 경우에는 그 상한액으로 한다. 육아휴직 시작일부터 3개월까지 월 통상임금에 해당하는 금액. 이 경우 상한액은 월 250만원으로 한다. 4개월째부터 6개월째까지 월 통상임금에 해당하는 금액. 이 경우 상한액은 월 200만원으로 한다. 7개월째부터 육아휴직 종료일까지 월 통상임금의 100분의 80에 해당하는 금액. 이 경우 상한액은 월 160만원으로 한다.",
    "모 또는 부에 해당하는 피보험자의 육아휴직 시작일부터 3개월까지 월 통상임금에 해당하는 금액. 이 경우 상한액은 월 300만원으로 한다. 4개월째부터 6개월째까지 월 통상임금에 해당하는 금액. 이 경우 상한액은 월 200만원으로 한다. 7개월째부터 육아휴직 종료일까지 월 통상임금의 100분의 80에 해당하는 금액. 이 경우 상한액은 월 160만원으로 한다. 각각 1개월인 경우 월 250만원 각각 2개월인 경우 월 250만원 각각 3개월인 경우 세 번째 달은 월 300만원 각각 4개월인 경우 네 번째 달은 월 350만원 각각 5개월인 경우 다섯 번째 달은 월 400만원 각각 6개월인 경우 여섯 번째 달은 월 450만원",
  )
  assert.equal(parental?.floor, 700_000)
  assert.equal(parental?.general[0].cap, 2_500_000)
  assert.equal(parental?.general[1].cap, 2_000_000)
  assert.equal(parental?.general[2].cap, 1_600_000)
  assert.equal(parental?.general[2].rate, 0.8)
  assert.equal(parental?.single[0].cap, 3_000_000)
  assert.equal(parental?.single[1].cap, 2_000_000)
  assert.equal(parental?.single[2].cap, 1_600_000)
  assert.equal(parental?.single[2].rate, 0.8)
  assert.deepEqual(parental?.bothCapsFirst6, [
    2_500_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000, 4_500_000,
  ])
})

async function withMockFetch(impl, fn) {
  const original = globalThis.fetch
  globalThis.fetch = impl
  try {
    await fn()
  } finally {
    globalThis.fetch = original
  }
}

test("getJson retries 503 then succeeds", async () => {
  let n = 0
  await withMockFetch(async () => {
    n += 1
    if (n < 3) return { ok: false, status: 503 }
    return { ok: true, status: 200, json: async () => ({ ok: true }) }
  }, async () => {
    const data = await getJson("https://example.test/law", { backoffMs: 0 })
    assert.deepEqual(data, { ok: true })
    assert.equal(n, 3)
  })
})

test("getJson retries 429 and network errors then throws TransientFetchError", async () => {
  let n = 0
  await withMockFetch(async () => {
    n += 1
    if (n === 1) return { ok: false, status: 429 }
    throw new TypeError("fetch failed")
  }, async () => {
    await assert.rejects(
      () => getJson("https://example.test/law", { tries: 3, backoffMs: 0 }),
      (error) => isTransientFetchError(error) && error instanceof TransientFetchError,
    )
    assert.equal(n, 3)
  })
})

test("getJson does not retry 404", async () => {
  let n = 0
  await withMockFetch(async () => {
    n += 1
    return { ok: false, status: 404 }
  }, async () => {
    await assert.rejects(() => getJson("https://example.test/law", { backoffMs: 0 }), /404/)
    assert.equal(n, 1)
  })
})

test("exitCodeForRefreshFailure keeps previous rates on transient HTTP, fails on parser miss", () => {
  const flake = new TransientFetchError("503 https://example.test/law", { status: 503 })
  const parser = new Error("월세 세액공제 파싱 실패")
  assert.equal(exitCodeForRefreshFailure(flake, { strict: true, hasPrev: true }), 0)
  assert.equal(exitCodeForRefreshFailure(parser, { strict: true, hasPrev: true }), 1)
  assert.equal(exitCodeForRefreshFailure(flake, { strict: true, hasPrev: false }), 1)
  assert.equal(exitCodeForRefreshFailure(parser, { strict: false, hasPrev: true }), 0)
})
