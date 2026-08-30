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
