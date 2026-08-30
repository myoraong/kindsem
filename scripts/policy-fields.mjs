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
