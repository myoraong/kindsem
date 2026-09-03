import { inflateSync } from "node:zlib"

export function parseKoreanWon(raw) {
  const s = String(raw).replace(/,/g, "").replace(/원/g, "").replace(/\s/g, "")
  if (!s) return null
  if (/^\d+$/.test(s)) return Number(s)
  let rest = s
  let total = 0
  const cheonEok = rest.match(/(\d+)천억/)
  if (cheonEok) {
    total += Number(cheonEok[1]) * 100_000_000_000
    rest = rest.replace(cheonEok[0], "")
  }
  const eok = rest.match(/(\d+)억/)
  if (eok) {
    total += Number(eok[1]) * 100_000_000
    rest = rest.replace(eok[0], "")
  }
  const cheonMan = rest.match(/(\d+)천만/)
  if (cheonMan) {
    total += Number(cheonMan[1]) * 10_000_000
    rest = rest.replace(cheonMan[0], "")
  }
  const man = rest.match(/(\d+)만/)
  if (man) {
    total += Number(man[1]) * 10_000
    rest = rest.replace(man[0], "")
  }
  return total || null
}

export function stripTags(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
}

export function parsePerMilleOrPercent(text) {
  const t = String(text).replace(/,/g, "")
  const mill =
    t.match(/1천분의\s*(\d+(?:\.\d+)?)/) ||
    t.match(/1[\s]*000분의\s*(\d+(?:\.\d+)?)/) ||
    t.match(/1000분의\s*(\d+(?:\.\d+)?)/)
  if (mill) return Number(mill[1]) / 1000
  const percent = t.match(/(\d+(?:\.\d+)?)\s*%/) || t.match(/(\d+(?:\.\d+)?)\s*퍼센트/)
  if (percent) return Number(percent[1]) / 100
  const bun = t.match(/100분의\s*(\d+(?:\.\d+)?)/)
  if (bun) return Number(bun[1]) / 100
  return null
}

export function findArticle(units, article, title, branch) {
  const list = Array.isArray(units) ? units : []
  return list.find((unit) => {
    if (String(unit.조문번호) !== String(article)) return false
    if (title && unit.조문제목 !== title) return false
    if (branch != null && String(unit.조문가지번호 ?? "") !== String(branch)) return false
    return true
  })
}

export function articleText(unit) {
  if (!unit) return ""
  return JSON.stringify(unit.항 ?? unit.조문내용 ?? unit)
}

export function appendixByTitle(body, titlePart) {
  const units = body?.법령?.별표?.별표단위 ?? body?.AdmRulService?.별표?.별표단위
  const list = Array.isArray(units) ? units : units ? [units] : []
  return list.find((item) => String(item.별표제목 || "").includes(titlePart))
}

function amountPattern() {
  return "(\\d[\\d,]*(?:억|천만|만)?원)"
}

function parseBandBlock(text) {
  const rows = []
  const re = new RegExp(
    `(?:${amountPattern()}\\s*이상\\s+)?${amountPattern()}\\s*미만[\\s\\S]{0,24}?1천분의\\s*(\\d+)(?:[\\s│┃]*(\\d+만원))?`,
    "g",
  )
  let match
  while ((match = re.exec(text))) {
    const max = parseKoreanWon(match[2])
    const rate = Number(match[3]) / 1000
    const cap = match[4] ? parseKoreanWon(match[4]) : null
    if (max && rate) rows.push({ max, rate, cap })
  }
  const last = text.match(
    /(\d[\d,]*(?:억|천만|만)?원)\s*이상(?!\s*\d[\d,]*(?:억|천만|만)?원\s*미만)[\s\S]{0,36}1천분의\s*(\d+)/,
  )
  if (last) {
    const rate = Number(last[2]) / 1000
    if (rate) rows.push({ max: Number.POSITIVE_INFINITY, rate, cap: null })
  }
  return rows
}

export function parseBrokerageHouse(text) {
  const clean = stripTags(text)
  const leaseIdx = clean.search(/2\.\s*임대차|임대차\s*등/)
  const saleText = leaseIdx > 0 ? clean.slice(0, leaseIdx) : clean
  const leaseText = leaseIdx > 0 ? clean.slice(leaseIdx) : ""
  return { sale: parseBandBlock(saleText), lease: parseBandBlock(leaseText) }
}

export function parseBrokerageOfficetel(text) {
  const clean = stripTags(text)
  const sale = clean.match(/매매[^\d]{0,24}1천분의\s*(\d+)/)
  const lease = clean.match(/임대차[^\d]{0,24}1천분의\s*(\d+)/)
  return {
    sale: sale ? Number(sale[1]) / 1000 : null,
    lease: lease ? Number(lease[1]) / 1000 : null,
  }
}

export function parseStampBands(text) {
  const t = stripTags(text)
  const bands = []
  const range =
    /기재금액이\s*([^이]+?)\s*초과\s*([^이]+?)\s*이하인 경우[:：]?\s*(\d+만?원)/g
  let match
  while ((match = range.exec(t))) {
    const upTo = parseKoreanWon(match[2])
    const duty = parseKoreanWon(match[3])
    if (upTo && duty != null) bands.push({ upTo, duty })
  }
  const over = t.match(/초과하는 경우[:：]?[\s\S]{0,48}?(\d+만?원)/)
  if (over) {
    const duty = parseKoreanWon(over[1])
    if (duty != null) bands.push({ upTo: Number.POSITIVE_INFINITY, duty })
  }
  return bands
}

export function parseHousingExempt(text) {
  const m = String(text).match(/기재금액이\s*([^이]+?)\s*이하인 것/)
  return m ? parseKoreanWon(m[1]) : null
}

export function extractSliceRates(text) {
  const t = stripTags(text)
  const cells = t
    .split(/[│┃]/)
    .map((cell) => cell.trim())
    .filter((cell) => cell && !cell.includes("──") && !cell.includes("──"))
  const rows = []
  let i = 0
  while (i < cells.length) {
    const cell = cells[i]
    const next = cells[i + 1] ?? ""
    const rate = parsePerMilleOrPercent(next)
    if (cell.endsWith("이하") && cell.includes("초과") && rate != null) {
      const cap = parseKoreanWon(cell.replace(/.*초과/, "").replace(/이하/g, ""))
      if (cap) rows.push({ cap, rate })
      i += 2
      continue
    }
    if (cell.endsWith("이하") && rate != null && !cell.includes("초과")) {
      const cap = parseKoreanWon(cell.replace(/이하/g, ""))
      if (cap) rows.push({ cap, rate })
      i += 2
      continue
    }
    if (cell.endsWith("초과") && rate != null) {
      const upper = cells[i + 2] ?? ""
      if (upper.endsWith("이하")) {
        const cap = parseKoreanWon(upper.replace(/이하/g, ""))
        if (cap && rate != null) rows.push({ cap, rate })
        i += 3
        continue
      }
      rows.push({ cap: Number.POSITIVE_INFINITY, rate })
      i += 2
      continue
    }
    i += 1
  }
  return rows
}

export function parseWonAfter(text, needle) {
  const i = String(text).indexOf(needle)
  if (i < 0) return null
  const slice = text.slice(i, i + 80)
  const m = slice.match(/(\d+(?:,\d+)?(?:억|천만|만)?원)/)
  return m ? parseKoreanWon(m[1]) : null
}

export function parseLtvFromBanking(text) {
  const t = stripTags(text)
  const general = t.match(/담보인정비율을\s*(\d+)\s*%\s*\(\s*규제지역의 경우\s*(\d+)\s*%/)
  const first = t.match(/생애최초주택구매자[\s\S]{0,80}담보인정비율을\s*(\d+)\s*%/)
  const firstCap = t.match(/생애최초주택구매자[\s\S]{0,120}주택담보대출금액은\s*(\S+원)을 초과할 수 없다/)
  const dsr = t.match(/총부채원리금상환비율이\s*(\d+)\s*%를 초과하지 않는/)
  return {
    unregulated: general ? Number(general[1]) / 100 : null,
    regulated: general ? Number(general[2]) / 100 : null,
    firstTime: first ? Number(first[1]) / 100 : null,
    firstTimeCap: firstCap ? parseKoreanWon(firstCap[1]) : null,
    dsrBank: dsr ? Number(dsr[1]) / 100 : null,
  }
}

export function parseVatRate(text) {
  const m = String(text).match(/세율은\s*(\d+)\s*퍼센트/)
  return m ? Number(m[1]) / 100 : null
}

/** 5천500만원, 410천원처럼 법령·고시 표기. */
export function parseLawWon(raw) {
  const s = String(raw).replace(/,/g, "").replace(/\s/g, "")
  const core = s.replace(/원.*/g, "").replace(/원/g, "")
  if (!core) return null
  if (/^\d+$/.test(core)) return Number(core)
  const mix = core.match(/^(\d+)천(\d+)만$/)
  if (mix) return (Number(mix[1]) * 1000 + Number(mix[2])) * 10_000
  const cheon = core.match(/^(\d+(?:\.\d+)?)천$/)
  if (cheon) return Math.round(Number(cheon[1]) * 1000)
  return parseKoreanWon(s.includes("원") ? s : `${core}원`)
}

export function parseRentCredit(text) {
  const t = stripTags(text).replace(/,/g, "")
  const salaryCap = t.match(/총급여액이\s*([0-9천백만억]+원)\s*이하인 근로소득이 있는 근로자\(해당 과세기간에 종합소득과세표준을 계산할 때 합산하는 종합소득금액이/)
  const incomeCap = t.match(
    /근로소득이 있는 근로자\(해당 과세기간에 종합소득과세표준을 계산할 때 합산하는 종합소득금액이\s*([0-9천백만억]+원)을 초과하는 사람은 제외한다\)가 대통령령/,
  )
  const rate = t.match(/그 금액의 100분의\s*(\d+)/)
  const high = t.match(
    /총급여액이\s*([0-9천백만억]+원)\s*이하인 근로소득이 있는 근로자\(해당 과세기간에 종합소득과세표준을 계산할 때 합산하는 종합소득금액이\s*([0-9천백만억]+원)을 초과하는 사람은 제외한다\)의 경우에는 100분의\s*(\d+)/,
  )
  const rentCap = t.match(/월세액이\s*([0-9천백만억]+원)을 초과하는 경우/)
  if (!salaryCap || !incomeCap || !rate || !high || !rentCap) return null
  return {
    salaryCap: parseLawWon(salaryCap[1]),
    incomeCap: parseLawWon(incomeCap[1]),
    rate: Number(rate[1]) / 100,
    salaryHighRate: parseLawWon(high[1]),
    incomeHighRate: parseLawWon(high[2]),
    rateLow: Number(high[3]) / 100,
    rentCap: parseLawWon(rentCap[1]),
  }
}

export function parseCarTax(text) {
  const t = stripTags(text).replace(/,/g, "")
  const p80 = t.match(/1000시시 이하[\s│|]*18원[\s\S]{0,40}1000시시 이하[\s│|]*(\d+)원/)
  const p140 = t.match(/1600시시 이하[\s│|]*18원[\s\S]{0,40}1600시시 이하[\s│|]*(\d+)원/)
  const p200 = t.match(/1600시시 초과[\s│|]*(\d+)원/)
  const c18a = t.match(/1000시시 이하[\s│|]*(\d+)원[\s\S]{0,40}1000시시 이하/)
  const c18b = t.match(/1600시시 이하[\s│|]*(\d+)원[\s\S]{0,40}1600시시 이하/)
  const c19a = t.match(/2000시시 이하[\s│|]*(\d+)원/)
  const c19b = t.match(/2500시시 이하[\s│|]*(\d+)원/)
  const c24 = t.match(/2500시시 초과[\s│|]*(\d+)원/)
  const ev = t.match(/그 밖의 승용자동차[\s\S]{0,80}?(\d+)원[\s│|]+(\d+)원/)
  if (!p80 || !p140 || !p200 || !c18a || !c18b || !c19a || !c19b || !c24 || !ev) return null
  return {
    private: [
      { maxCc: 1000, perCc: Number(p80[1]) },
      { maxCc: 1600, perCc: Number(p140[1]) },
      { maxCc: Number.POSITIVE_INFINITY, perCc: Number(p200[1]) },
    ],
    commercial: [
      { maxCc: 1000, perCc: Number(c18a[1]) },
      { maxCc: 1600, perCc: Number(c18b[1]) },
      { maxCc: 2000, perCc: Number(c19a[1]) },
      { maxCc: 2500, perCc: Number(c19b[1]) },
      { maxCc: Number.POSITIVE_INFINITY, perCc: Number(c24[1]) },
    ],
    evPrivate: Number(ev[2]),
  }
}

export function parseCarTaxEducation(text) {
  const m = String(text).match(/자동차세액의 100분의\s*(\d+)/)
  return m ? Number(m[1]) / 100 : null
}

export function parseLaborHours(text18, text50, text60) {
  const t18 = stripTags(text18)
  const t50 = stripTags(text50)
  const t60 = stripTags(text60)
  const shortHour = t18.match(/소정근로시간이\s*(\d+)시간 미만/)
  const weekly = t50.match(/1주 간의 근로시간은[\s\S]{0,40}?(\d+)시간을 초과/)
  const daily = t50.match(/1일의 근로시간은[\s\S]{0,40}?(\d+)시간을 초과/)
  const leaveBase = t60.match(/(\d+)일의 유급휴가/)
  const leaveCap = t60.match(/총 휴가 일수는\s*(\d+)일을 한도로/)
  if (!shortHour || !weekly || !daily || !leaveBase || !leaveCap) return null
  return {
    weeklyFullHours: Number(weekly[1]),
    dailyHours: Number(daily[1]),
    shortHourThreshold: Number(shortHour[1]),
    annualLeaveBase: Number(leaveBase[1]),
    annualLeaveCap: Number(leaveCap[1]),
  }
}

export function parsePensionBase(text) {
  const t = stripTags(text).replace(/,/g, "")
  const floor = t.match(/하한액\s*[:：]\s*([0-9.]+천원|\d+원|\d+천원)/)
  const ceil = t.match(/상한액\s*[:：]\s*([0-9.]+천원|\d+원|\d+천원)/)
  if (!floor || !ceil) return null
  return { floor: parseLawWon(floor[1]), ceil: parseLawWon(ceil[1]) }
}

export function parsePensionEmployeeRate(buchikText, year) {
  const t = stripTags(buchikText)
  const special = t.match(new RegExp(`${year}년은 1만분의\\s*(\\d+)`))
  if (special) return Number(special[1]) / 10_000
  const main = t.match(/기준소득월액의 1천분의\s*(\d+)/)
  return main ? Number(main[1]) / 1000 : null
}

export function parseHealthWorkplaceRate(text) {
  const m = stripTags(text).match(/직장가입자의 보험료율[\s\S]{0,40}1만분의\s*(\d+)/)
  return m ? Number(m[1]) / 10_000 : null
}

export function parseLongTermCareRate(text) {
  const m = stripTags(text).match(/장기요양보험료율은 100만분의\s*([\d,]+)/)
  return m ? Number(m[1].replace(/,/g, "")) / 1_000_000 : null
}

export function parseEmploymentUnempRate(text) {
  const m = stripTags(text).match(/실업급여의 보험료율:\s*1천분의\s*(\d+)/)
  return m ? Number(m[1]) / 1000 : null
}

export function parseHealthCapNotice(text) {
  const t = stripTags(text).replace(/,/g, "")
  const cap = t.match(/제2조[\s\S]*?보수월액보험료\s*[:：]\s*(\d+)원/)
  const floor = t.match(/제3조[\s\S]*?보수월액보험료\s*[:：]\s*(\d+)원/)
  if (!cap || !floor) return null
  return { totalCap: Number(cap[1]), floor: Number(floor[1]) }
}

export function parseVehicleAcquisition(text) {
  const t = stripTags(text)
  const passenger = t.match(/비영업용 승용자동차:\s*1천분의\s*(\d+(?:\.\d+)?)/)
  const compact = t.match(/경자동차[\s\S]{0,40}?1천분의\s*(\d+(?:\.\d+)?)/)
  const otherSection = t.includes("그 밖의 자동차") ? t.slice(t.indexOf("그 밖의 자동차")) : t
  const otherPrivate = otherSection.match(/비영업용:\s*1천분의\s*(\d+(?:\.\d+)?)/)
  const commercial = otherSection.match(/(?<![비])영업용:\s*1천분의\s*(\d+(?:\.\d+)?)/)
  if (!passenger || !compact || !otherPrivate || !commercial) return null
  return {
    passenger: Number(passenger[1]) / 1000,
    compact: Number(compact[1]) / 1000,
    otherPrivate: Number(otherPrivate[1]) / 1000,
    commercial: Number(commercial[1]) / 1000,
  }
}

export function parseVehicleEducation(text) {
  const t = stripTags(text)
  const offset = t.match(/1천분의\s*(\d+)을 뺀 세율/)
  const share = t.match(/산출한 금액\)의 100분의\s*(\d+)/) || t.match(/산출한 금액의 100분의\s*(\d+)/)
  if (!offset || !share) return null
  return { offset: Number(offset[1]) / 1000, share: Number(share[1]) / 100 }
}

export function parseCompactRelief(text) {
  const t = stripTags(text)
  const amount = t.match(/취득세액이\s*(\d+)만원 이하인 경우[:：]?\s*취득세를 면제/)
  const until = t.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일까지[\s\S]{0,24}?감면/)
  if (!amount || !until) return null
  return {
    relief: Number(amount[1]) * 10_000,
    until: `${until[1]}-${String(until[2]).padStart(2, "0")}-${String(until[3]).padStart(2, "0")}`,
  }
}

export function parseOvertime(text) {
  const t = stripTags(text)
  const ot = t.match(/연장근로[\s\S]{0,80}?100분의\s*(\d+)/)
  const hol = t.match(/8시간 이내의 휴일근로:\s*통상임금의 100분의\s*(\d+)/)
  const holOver = t.match(/8시간을 초과한 휴일근로:\s*통상임금의 100분의\s*(\d+)/)
  const night = t.match(/야간근로[\s\S]{0,80}?100분의\s*(\d+)/)
  const split = t.match(/(\d+)시간 이내의 휴일근로/)
  if (!ot || !hol || !holOver || !night || !split) return null
  return {
    overtimePremium: Number(ot[1]) / 100,
    holidayPremium: Number(hol[1]) / 100,
    holidayOverPremium: Number(holOver[1]) / 100,
    nightPremium: Number(night[1]) / 100,
    holidaySplitHours: Number(split[1]),
  }
}

export function parseInterestNationalRate(text) {
  const m = stripTags(text).match(/그 밖의 이자소득에 대해서는 100분의\s*(\d+)/)
  return m ? Number(m[1]) / 100 : null
}

export function parseLocalWithholdingShare(text) {
  const m = stripTags(text).match(
    /원천징수하는 소득세[\s\S]{0,160}?100분의\s*(\d+)에 해당하는 금액을 소득세 원천징수와 동시에 개인지방소득세/,
  )
  return m ? Number(m[1]) / 100 : null
}

export function parseBizWithholding(text) {
  const m = stripTags(text).match(/원천징수대상 사업소득에 대해서는 100분의\s*(\d+)/)
  return m ? Number(m[1]) / 100 : null
}

export function parseMealExempt(text) {
  const m = stripTags(text).match(/월\s*(\d+)만원 이하의 식사대/)
  return m ? Number(m[1]) * 10_000 : null
}

export function parseYouthRelief(text) {
  const t = stripTags(text)
  const rate = t.match(/청년의 경우에는 100분의\s*(\d+)/)
  const cap = t.match(/과세기간별로\s*(\d+)만원을 한도/)
  if (!rate || !cap) return null
  return { rate: Number(rate[1]) / 100, cap: Number(cap[1]) * 10_000 }
}

export function parseBasicPersonDeduction(text) {
  const m = stripTags(text).match(/1명당 연\s*(\d+)만원을 곱하여/)
  return m ? Number(m[1]) * 10_000 : null
}

export function parseEarnedDeductionCap(text) {
  const m = stripTags(text).match(/공제액이\s*([0-9천백만억]+원)을 초과하는 경우에는/)
  return m ? parseLawWon(m[1]) : null
}

export function parseSeveranceDays(text) {
  const m = stripTags(text).match(/1년에 대하여\s*(\d+)일분 이상/)
  return m ? Number(m[1]) : null
}

export function parseDeMinimisUsd(text) {
  const m = stripTags(text).match(/미화\s*(\d+)달러 이하의 물품으로서 자가사용/)
  return m ? Number(m[1]) : null
}

export function parseListClearance(text) {
  const t = stripTags(text)
  const m = t.match(
    /미화\s*(\d+)달러\(대한민국과 미합중국[\s\S]{0,80}?미화\s*(\d+)달러\)\s*이하에 해당하는 물품\(이하 "목록통관/,
  )
  if (!m) return null
  return { listUsd: Number(m[1]), listUsUsd: Number(m[2]) }
}

function parentalBand(text, startRe, withRate) {
  const slice = text.match(startRe)
  if (!slice) return null
  const cap =
    slice[0].match(/(\d+)만원을 넘는/) ||
    slice[0].match(/상한액은 월\s*(\d+)만원/) ||
    slice[0].match(/상한액은\s*(\d+)만원/)
  const floor = slice[0].match(/(\d+)만원보다 적은/)
  const rate = withRate ? slice[0].match(/100분의\s*(\d+)/) : null
  if (!cap) return null
  return {
    cap: Number(cap[1]) * 10_000,
    floor: floor ? Number(floor[1]) * 10_000 : null,
    rate: withRate ? Number(rate?.[1] || 0) / 100 : 1,
  }
}

export function parseParentalLeave(generalText, specialText) {
  const g = stripTags(generalText)
  const s = stripTags(specialText)
  const preambleFloor = g.match(/(\d+)만원보다 적은/)
  const first = parentalBand(g, /시작일부터 3개월까지[\s\S]{0,280}?만원으로 한/, false)
  const mid = parentalBand(g, /4개월째부터 6개월째까지[\s\S]{0,280}?만원으로 한/, false)
  const last = parentalBand(g, /7개월째부터[\s\S]{0,300}?만원으로 한/, true)
  const singleIdx = s.indexOf("모 또는 부에 해당하는 피보험자")
  const singleSrc = singleIdx >= 0 ? s.slice(singleIdx) : s
  const singleFirst = parentalBand(singleSrc, /시작일부터 3개월까지[\s\S]{0,280}?만원으로 한/, false)
  const singleMid = parentalBand(singleSrc, /4개월째부터 6개월째까지[\s\S]{0,280}?만원으로 한/, false)
  const singleLast = parentalBand(singleSrc, /7개월째부터[\s\S]{0,300}?만원으로 한/, true)
  const bothCaps = [
    s.match(/각각 1개월인 경우[\s\S]{0,80}?월\s*(\d+)만원/),
    s.match(/각각 2개월인 경우[\s\S]{0,120}?월\s*(\d+)만원/),
    s.match(/각각 3개월인 경우[\s\S]{0,200}?세 번째 달은 월\s*(\d+)만원/),
    s.match(/각각 4개월인 경우[\s\S]{0,240}?네 번째 달은 월\s*(\d+)만원/),
    s.match(/각각 5개월인 경우[\s\S]{0,280}?다섯 번째 달은 월\s*(\d+)만원/),
    s.match(/각각 6개월인 경우[\s\S]{0,320}?여섯 번째 달은 월\s*(\d+)만원/),
  ].map((m) => (m ? Number(m[1]) * 10_000 : null))
  if (
    !first ||
    !mid ||
    !last ||
    !singleFirst ||
    !singleMid ||
    !singleLast ||
    bothCaps.some((v) => v == null)
  ) {
    return null
  }
  const floor = first.floor ?? (preambleFloor ? Number(preambleFloor[1]) * 10_000 : null)
  if (floor == null) return null
  return {
    floor,
    general: [
      { fromMonth: 1, toMonth: 3, rate: first.rate, cap: first.cap },
      { fromMonth: 4, toMonth: 6, rate: mid.rate, cap: mid.cap },
      { fromMonth: 7, toMonth: Number.POSITIVE_INFINITY, rate: last.rate, cap: last.cap },
    ],
    single: [
      { fromMonth: 1, toMonth: 3, rate: 1, cap: singleFirst.cap },
      { fromMonth: 4, toMonth: 6, rate: singleMid.rate, cap: singleMid.cap },
      { fromMonth: 7, toMonth: Number.POSITIVE_INFINITY, rate: singleLast.rate, cap: singleLast.cap },
    ],
    bothCapsFirst6: bothCaps,
  }
}

function pdfObjectSlice(src, num) {
  const re = new RegExp(`(?:^|[\\n\\r])${num}\\s+0\\s+obj\\b`)
  const m = src.match(re)
  if (!m || m.index == null) return ""
  const start = m.index + (src[m.index] === "\n" || src[m.index] === "\r" ? 1 : 0)
  const end = src.indexOf("endobj", start)
  return end > start ? src.slice(start, end) : src.slice(start, start + 80_000)
}

function inflatePdfStream(objSlice) {
  const m = objSlice.match(/stream\r?\n([\s\S]*?)endstream/)
  if (!m) return ""
  try {
    return inflateSync(Buffer.from(m[1], "latin1")).toString("latin1")
  } catch {
    return ""
  }
}

function parsePdfCmap(cmapText) {
  const map = new Map()
  const bfchar = cmapText.match(/beginbfchar([\s\S]*?)endbfchar/g) || []
  for (const block of bfchar) {
    for (const row of block.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      map.set(row[1].toLowerCase(), String.fromCharCode(parseInt(row[2], 16)))
    }
  }
  const bfrange = cmapText.match(/beginbfrange([\s\S]*?)endbfrange/g) || []
  for (const block of bfrange) {
    for (const row of block.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const from = parseInt(row[1], 16)
      const to = parseInt(row[2], 16)
      const base = parseInt(row[3], 16)
      const width = row[1].length
      for (let i = from; i <= to; i++) {
        map.set(i.toString(16).padStart(width, "0"), String.fromCharCode(base + (i - from)))
      }
    }
  }
  return map
}

function decodePdfHex(hex, cmap, unit) {
  const h = hex.replace(/\s/g, "")
  let out = ""
  for (let i = 0; i < h.length; i += unit) {
    const key = h.slice(i, i + unit).toLowerCase()
    out += cmap.get(key) ?? cmap.get(key.slice(-2)) ?? ""
  }
  return out
}

function inflateAllPdfStreams(src) {
  const out = []
  for (const m of src.matchAll(/stream\r?\n([\s\S]*?)endstream/g)) {
    try {
      out.push(inflateSync(Buffer.from(m[1], "latin1")).toString("latin1"))
    } catch {
      /* 이미지나 이미 압축 해제된 스트림 */
    }
  }
  return out
}

function cmapUnit(cmap) {
  return [...cmap.keys()].reduce((max, key) => Math.max(max, key.length), 2)
}

function scoreDecoded(text) {
  return (String(text).match(/[가-힣0-9]/g) || []).length
}

function decodeHexWithCmaps(hex, preferred, cmaps) {
  if (preferred) {
    const text = decodePdfHex(hex, preferred, cmapUnit(preferred))
    if (scoreDecoded(text) > 0 || text.trim()) return text
  }
  let best = ""
  let bestScore = -1
  for (const cmap of cmaps) {
    if (!cmap || cmap === preferred) continue
    const text = decodePdfHex(hex, cmap, cmapUnit(cmap))
    const score = scoreDecoded(text)
    if (score > bestScore) {
      best = text
      bestScore = score
    }
  }
  return best
}

function collectType3Fonts(src) {
  const fonts = new Map()
  const scan = (text) => {
    for (const m of text.matchAll(/\/Name\s*\/(T\d+)\b[\s\S]{0,400}?\/ToUnicode\s+(\d+)\s+0\s+R/g)) {
      const cmapText = inflatePdfStream(pdfObjectSlice(src, m[2]))
      if (cmapText) fonts.set(m[1], parsePdfCmap(cmapText))
    }
  }
  scan(src)
  for (const inf of inflateAllPdfStreams(src)) {
    if (inf.includes("/ToUnicode") && inf.includes("/Name")) scan(inf)
  }
  return fonts
}

/**
 * 고용노동부 고시처럼 Type3 + ToUnicode 인 PDF에서 글자를 읽습니다.
 * 최저임금 고시는 JSON 조문내용이 비어 첨부 PDF만 있습니다.
 */
export function extractType3PdfText(buffer) {
  const src = Buffer.from(buffer).toString("latin1")
  const inflated = inflateAllPdfStreams(src)
  const cmaps = inflated.filter((t) => t.includes("beginbfchar") || t.includes("beginbfrange")).map(parsePdfCmap)
  const fonts = collectType3Fonts(src)
  const contents = inflated.filter((t) => t.includes(" Tf") && (t.includes("Tj") || t.includes("TJ")))
  if (contents.length === 0) {
    for (const m of src.matchAll(/\/Contents\s+(\d+)\s+0\s+R/g)) {
      const text = inflatePdfStream(pdfObjectSlice(src, m[1]))
      if (text.includes("Tj") || text.includes("TJ")) contents.push(text)
    }
  }
  const parts = []
  for (const content of contents) {
    let cmap = fonts.size ? fonts.values().next().value : null
    const tokens = content.matchAll(/\/(T\d+)\s+[\d.]+\s+Tf|\[(.*?)\]\s*TJ|\((.*?)\)\s*Tj|<([0-9A-Fa-f\s]+)>\s*Tj/g)
    for (const tok of tokens) {
      if (tok[1]) {
        cmap = fonts.get(tok[1]) ?? (fonts.size ? cmap : null)
        continue
      }
      if (tok[2] != null) {
        let chunk = ""
        for (const hex of tok[2].matchAll(/<([0-9A-Fa-f\s]+)>/g)) {
          chunk += decodeHexWithCmaps(hex[1], cmap, cmaps)
        }
        parts.push(chunk)
        continue
      }
      if (tok[3] != null) {
        parts.push(tok[3])
        continue
      }
      if (tok[4] != null) parts.push(decodeHexWithCmaps(tok[4], cmap, cmaps))
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim()
}

export function parseMinWageNotice(text) {
  const compact = stripTags(text).replace(/\s+/g, "")
  const hourly =
    compact.match(/모든산업(\d{1,3}(?:,\d{3})+)원/) ||
    compact.match(/시간급(\d{1,3}(?:,\d{3})+)원/)
  const monthly = compact.match(/월환산액(\d{1,3}(?:,\d{3})+)원/)
  const monthHours = compact.match(/월환산기준시간수(\d+)시간/)
  const weekly = compact.match(/주소정근로(\d+)시간/)
  const holiday = compact.match(/유급주휴(\d+)시간/)
  const fromTo =
    compact.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})\.~(\d{4})\.(\d{1,2})\.(\d{1,2})/) ||
    compact.match(/(\d{4})년(\d{1,2})월(\d{1,2})일부터(\d{4})년(\d{1,2})월(\d{1,2})일까지/)
  if (!hourly || !monthly || !monthHours || !weekly || !holiday || !fromTo) return null
  const pad = (v) => String(Number(v)).padStart(2, "0")
  return {
    hourly: Number(hourly[1].replace(/,/g, "")),
    monthly: Number(monthly[1].replace(/,/g, "")),
    monthlyHours: Number(monthHours[1]),
    weeklyHours: Number(weekly[1]),
    weeklyHolidayHours: Number(holiday[1]),
    year: Number(fromTo[1]),
    from: `${fromTo[1]}-${pad(fromTo[2])}-${pad(fromTo[3])}`,
    to: `${fromTo[4]}-${pad(fromTo[5])}-${pad(fromTo[6])}`,
  }
}

export function parseLaborMaternity(text) {
  const t = stripTags(text)
  const days = t.match(
    /출산 전과 출산 후를 통하여\s*(\d+)일\(미숙아를 출산한 경우에는\s*(\d+)일, 한 번에 둘 이상 자녀를 임신한 경우에는\s*(\d+)일\)/,
  )
  const paid = t.match(
    /휴가 중 최초\s*(\d+)일\(한 번에 둘 이상 자녀를 임신한 경우에는\s*(\d+)일\)은 유급/,
  )
  const after = t.match(
    /출산 후에\s*(\d+)일\(한 번에 둘 이상 자녀를 임신한 경우에는\s*(\d+)일\) 이상/,
  )
  if (!days || !paid || !after) return null
  return {
    days: { standard: Number(days[1]), preterm: Number(days[2]), multiple: Number(days[3]) },
    employerPaidDays: { standard: Number(paid[1]), multiple: Number(paid[2]) },
    afterBirthMinDays: { standard: Number(after[1]), multiple: Number(after[2]) },
  }
}

export function parseEiMaternity(text) {
  const t = stripTags(text)
  const extra = t.match(
    /휴가 기간 중\s*(\d+)일\(한 번에 둘 이상의 자녀를 임신한 경우에는\s*(\d+)일\)을 초과한 일수\((\d+)일을 한도로 하되, 미숙아를 출산한 경우에는\s*(\d+)일을 한도로 하고, 한 번에 둘 이상의 자녀를 임신한 경우에는\s*(\d+)일을 한도로 한다\)/,
  )
  if (!extra) return null
  return {
    nonPriorityPaidDays: { standard: Number(extra[1]), multiple: Number(extra[2]) },
    eiExtraCapDays: {
      standard: Number(extra[3]),
      preterm: Number(extra[4]),
      multiple: Number(extra[5]),
    },
  }
}

function noticeWon(raw) {
  const s = String(raw).replace(/\s/g, "")
  if (s.includes("만원")) return parseKoreanWon(s)
  return parseLawWon(s)
}

export function parseMaternityCapNotice(text) {
  const t = stripTags(text).replace(/\s+/g, "")
  const standard = t.match(/유산ㆍ사산휴가기간(\d+)일에대한통상임금에상당하는금액이([0-9,만]+)원을초과하는경우:([0-9,만]+)원/)
  const preterm = t.match(/미숙아를출산한경우의출산전후휴가기간(\d+)일에대한통상임금에상당하는금액이([0-9,만]+)원을초과하는경우:([0-9,만]+)원/)
  const multiple = t.match(/둘이상의자녀를임신한경우의출산전후휴가기간(\d+)일에대한통상임금에상당하는금액이([0-9,만]+)원을초과하는경우:([0-9,만]+)원/)
  if (!standard || !preterm || !multiple) return null
  const standardCap = noticeWon(standard[3])
  const pretermCap = noticeWon(preterm[3])
  const multipleCap = noticeWon(multiple[3])
  if (!standardCap || !pretermCap || !multipleCap) return null
  return {
    cap: { standard: standardCap, preterm: pretermCap, multiple: multipleCap },
    capDays: {
      standard: Number(standard[1]),
      preterm: Number(preterm[1]),
      multiple: Number(multiple[1]),
    },
  }
}
