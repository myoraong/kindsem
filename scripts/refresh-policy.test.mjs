import assert from "node:assert/strict"
import test from "node:test"
import { extractProgressive, parseGiftDeductions, parseKoreanWon } from "./refresh-policy.mjs"
import {
  parseBrokerageHouse,
  parseLtvFromBanking,
  parseStampBands,
  parseVatRate,
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
