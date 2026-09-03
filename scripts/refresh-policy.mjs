#!/usr/bin/env node
/**
 * 법제처 현행 법령에서 세율 표를 읽어 lib/policy.generated.ts 와 public/policy.json 을 갱신합니다.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  appendixByTitle,
  extractSliceRates,
  parseBrokerageHouse,
  parseBrokerageOfficetel,
  parseHousingExempt,
  parseLtvFromBanking,
  parsePerMilleOrPercent,
  parseStampBands,
  parseVatRate,
  parseWonAfter,
  parseRentCredit,
  parseCarTax,
  parseCarTaxEducation,
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
  extractType3PdfText,
  parseMinWageNotice,
  parseLaborMaternity,
  parseEiMaternity,
  parseMaternityCapNotice,
  parseKoreanWon,
  parseRetirementDeductions,
  parseInheritancePersonal,
  parseInheritanceFinance,
} from "./policy-fields.mjs"

export { parseKoreanWon }

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const OC = process.env.LAW_OC || "test"

const LAWS = [
  { key: "income", query: "소득세법", id: "001565", article: "55", title: "세율" },
  { key: "gift", query: "상속세 및 증여세법", id: "001561", article: "26", title: "상속세 세율" },
  { key: "corp", query: "법인세법", id: "001563", article: "55", title: "세율" },
  { key: "local", query: "지방세법", id: "001649" },
  { key: "holding", query: "종합부동산세법", id: "009873" },
  { key: "brokerage", query: "공인중개사법 시행규칙", id: "007292" },
  { key: "firstHome", query: "지방세특례제한법", id: "011178" },
  { key: "stamp", query: "인지세법", id: "001568" },
  { key: "rural", query: "농어촌특별세법", id: "001569" },
  { key: "vat", query: "부가가치세법", id: "001571" },
  { key: "holdingDecree", query: "종합부동산세법 시행령", id: "009968" },
  { key: "specialTax", query: "조세특례제한법", id: "001584" },
  { key: "laborStd", query: "근로기준법", id: "001872" },
  { key: "minWageDecree", query: "최저임금법 시행령", id: "005247" },
  { key: "pension", query: "국민연금법", id: "001781" },
  { key: "nhisDecree", query: "국민건강보험법 시행령", id: "002813" },
  { key: "ltcDecree", query: "노인장기요양보험법 시행령", id: "010526" },
  {
    key: "eiPremiumDecree",
    query: "고용보험 및 산업재해보상보험의 보험료징수 등에 관한 법률 시행령",
    id: "009842",
  },
  { key: "eiLeaveDecree", query: "고용보험법 시행령", id: "002249" },
  { key: "eiLaw", query: "고용보험법", id: "001761" },
  { key: "customsRule", query: "관세법 시행규칙", id: "006392" },
  { key: "severanceLaw", query: "근로자퇴직급여 보장법", id: "009883" },
]

export class TransientFetchError extends Error {
  /**
   * 법제처 Open API의 429·5xx·네트워크 오류처럼 잠깐 났다가 사라지는 조회 실패.
   * @param {string} message
   * @param {{ status?: number, cause?: unknown }} [opts]
   */
  constructor(message, opts = {}) {
    super(message, opts.cause != null ? { cause: opts.cause } : undefined)
    this.name = "TransientFetchError"
    this.status = opts.status
  }
}

export function isTransientFetchError(error) {
  return error instanceof TransientFetchError || error?.name === "TransientFetchError"
}

/** POLICY_STRICT 잡에서 일시 조회 실패면 메일 없이 이전 세율을 남기고, 파서 실패는 그대로 실패. */
export function exitCodeForRefreshFailure(error, { strict = false, hasPrev = false } = {}) {
  if (hasPrev && isTransientFetchError(error)) return 0
  if (strict || !hasPrev) return 1
  return 0
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 법제처 샘플 URL은 http www.law.go.kr 이다. https가 죽으면 그다음으로 받는다. */
export const LAW_API_ORIGINS = ["https://www.law.go.kr", "http://www.law.go.kr"]

export const LAW_FETCH_HEADERS = {
  Accept: "application/json, text/plain, */*",
  Referer: "https://www.law.go.kr/",
  "User-Agent": "Mozilla/5.0 (compatible; Kindsem/1.0; +https://kindsem.com/)",
}

export function lawUrlFallbacks(url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return [url]
  }
  if (!/(^|\.)law\.go\.kr$/i.test(parsed.host)) return [url]
  const path = parsed.pathname + parsed.search
  const origins = [`${parsed.protocol}//${parsed.host}`, ...LAW_API_ORIGINS]
  const out = []
  for (const origin of origins) {
    const next = `${origin}${path}`
    if (!out.includes(next)) out.push(next)
  }
  return out
}

function isTransientHttpStatus(status) {
  return status === 403 || status === 408 || status === 425 || status === 429 || status >= 500
}

function isRetryableNetworkError(error) {
  if (!error) return false
  if (isTransientFetchError(error)) return true
  if (error.name === "AbortError" || error.name === "TimeoutError") return true
  if (error instanceof TypeError) return true
  const code = error.cause?.code || error.code
  return [
    "ECONNRESET",
    "ETIMEDOUT",
    "ENOTFOUND",
    "EAI_AGAIN",
    "ECONNREFUSED",
    "UND_ERR_CONNECT_TIMEOUT",
    "UND_ERR_SOCKET",
    "UND_ERR_HEADERS_TIMEOUT",
    "UND_ERR_BODY_TIMEOUT",
  ].includes(code)
}

async function parseOkJson(res, url) {
  if (typeof res.text === "function") {
    const text = String(await res.text()).trim()
    if (!text) throw new TransientFetchError(`빈 응답 ${url}`)
    if (text.startsWith("<")) throw new TransientFetchError(`HTML 응답 ${url}`)
    try {
      return JSON.parse(text)
    } catch (error) {
      throw new TransientFetchError(`응답 JSON 실패 ${url}`, { cause: error })
    }
  }
  try {
    return await res.json()
  } catch (error) {
    throw new TransientFetchError(`응답 JSON 실패 ${url}`, { cause: error })
  }
}

function wrapFetchError(error, url) {
  if (isTransientFetchError(error)) return error
  if (error.name === "AbortError" || error.name === "TimeoutError") {
    return new TransientFetchError(`타임아웃 ${url}`, { cause: error })
  }
  if (isRetryableNetworkError(error)) {
    return new TransientFetchError(error.message || String(error), { cause: error })
  }
  return error
}

/**
 * @param {string} url
 * @param {{ tries?: number, backoffMs?: number, timeoutMs?: number }} [opts]
 */
export async function getJson(url, opts = {}) {
  const tries = opts.tries ?? 3
  const backoffMs = opts.backoffMs ?? 1000
  const timeoutMs = opts.timeoutMs ?? 25_000
  const urls = lawUrlFallbacks(url)
  let lastError
  for (let attempt = 1; attempt <= tries; attempt++) {
    for (const candidate of urls) {
      try {
        const res = await fetch(candidate, {
          headers: LAW_FETCH_HEADERS,
          signal: AbortSignal.timeout(timeoutMs),
        })
        if (res.ok) return await parseOkJson(res, candidate)
        const message = `${res.status} ${candidate}`
        if (!isTransientHttpStatus(res.status)) {
          lastError = new Error(message)
          continue
        }
        lastError = new TransientFetchError(message, { status: res.status })
      } catch (error) {
        lastError = wrapFetchError(error, candidate)
        if (!isTransientFetchError(lastError)) {
          continue
        }
      }
    }
    if (lastError && !isTransientFetchError(lastError) && !isRetryableNetworkError(lastError)) {
      throw lastError
    }
    if (attempt < tries) {
      const wait = backoffMs * 2 ** (attempt - 1)
      console.warn(`법제처 조회 재시도 ${attempt}/${tries} ${wait}ms 후: ${lastError?.message}`)
      if (wait > 0) await sleep(wait)
    }
  }
  throw lastError
}

function stripTags(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
}

function rateFrom(cell) {
  const percent = cell.match(/(\d+)\s*퍼센트/)
  if (percent) return Number(percent[1]) / 100
  const bun = cell.match(/100분의\s*(\d+)/)
  if (bun) return Number(bun[1]) / 100
  return null
}

function interceptFrom(cell) {
  const match = cell.match(/^([0-9,][^+(]{0,24}원)\s*\+/)
  return match ? parseKoreanWon(match[1]) : null
}

function firstGrid(text) {
  const start = text.indexOf("┌")
  const end = text.indexOf("└")
  if (start >= 0 && end > start) return text.slice(start, end + 1)
  return text
}

export function extractProgressive(text) {
  return extractProgressiveCells(firstGrid(text))
}

function extractProgressiveCells(text) {
  const t = stripTags(text)
  const cells = t
    .split("│")
    .map((cell) => cell.trim())
    .filter((cell) => cell && !cell.includes("──"))
  const rows = []
  let i = 0
  while (i < cells.length) {
    const cell = cells[i]
    const next = cells[i + 1] ?? ""
    if (cell.endsWith("이하") && rateFrom(next) !== null && !next.includes("+")) {
      const upTo = parseKoreanWon(cell.replace(/이하/g, ""))
      const rate = rateFrom(next)
      if (upTo && rate) rows.push({ upTo, rate, deduction: 0 })
      i += 2
      continue
    }
    if (cell.endsWith("초과") && interceptFrom(next) !== null && rateFrom(next) !== null) {
      const floor = parseKoreanWon(cell.replace(/초과/g, ""))
      const intercept = interceptFrom(next)
      const rate = rateFrom(next)
      const upper = cells[i + 2] ?? ""
      if (upper.endsWith("이하")) {
        const upTo = parseKoreanWon(upper.replace(/이하/g, ""))
        if (upTo && floor && intercept !== null && rate) {
          rows.push({ upTo, rate, deduction: Math.round(floor * rate - intercept) })
        }
        i += 3
        continue
      }
      if (floor && intercept !== null && rate) {
        rows.push({
          upTo: Number.POSITIVE_INFINITY,
          rate,
          deduction: Math.round(floor * rate - intercept),
        })
      }
      i += 2
      continue
    }
    i += 1
  }
  return rows
}

export function parseGiftDeductions(unit) {
  const ho = unit?.항?.호
  const list = Array.isArray(ho) ? ho : ho ? [ho] : []
  const amounts = {}
  for (const item of list) {
    const text = String(item.호내용 || "")
    const afterColon = text.split(":").slice(1).join(":")
    const amount = parseKoreanWon(afterColon)
    if (!amount) continue
    if (text.includes("배우자로부터")) amounts.spouse = amount
    else if (text.includes("직계존속")) amounts.ascendant = amount
    else if (text.includes("직계비속")) amounts.descendant = amount
    else if (text.includes("혈족") || text.includes("인척")) amounts.other = amount
  }
  return amounts
}

function findArticle(units, article, title, branch) {
  const list = Array.isArray(units) ? units : []
  return list.find((unit) => {
    if (String(unit.조문번호) !== String(article)) return false
    if (!unit.조문제목) return false
    if (title && unit.조문제목 !== title) return false
    if (branch == null) return !unit.조문가지번호
    return String(unit.조문가지번호 ?? "") === String(branch)
  })
}

function articleText(unit) {
  if (!unit) return ""
  return JSON.stringify(unit.항 ?? unit.조문내용 ?? unit, null, 0)
}

function admText(body) {
  const svc = body?.AdmRulService || {}
  const content = svc.조문내용
  if (Array.isArray(content)) return content.join("\n")
  if (typeof content === "string") return content
  return JSON.stringify(svc)
}

function assertProgressiveConsistent(rows, label) {
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1]
    const cur = rows[i]
    const at = prev.upTo
    if (!Number.isFinite(at)) continue
    const prevTax = at * prev.rate - prev.deduction
    const curTax = at * cur.rate - cur.deduction
    if (Math.abs(prevTax - curTax) > 2) {
      throw new Error(`${label} 누진공제 불일치 (${at}: ${prevTax} vs ${curTax})`)
    }
  }
}

function ymd(value) {
  const s = String(value || "")
  if (s.length === 8) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
  return s
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

function tsLiteral(rows) {
  return rows
    .map((row) => {
      const upTo =
        row.upTo === Number.POSITIVE_INFINITY ? "Number.POSITIVE_INFINITY" : String(row.upTo)
      return `  { upTo: ${upTo}, rate: ${row.rate}, deduction: ${row.deduction} }`
    })
    .join(",\n")
}

export async function fetchLawMeta(query, id) {
  const url = `https://www.law.go.kr/DRF/lawSearch.do?OC=${encodeURIComponent(OC)}&target=law&type=JSON&query=${encodeURIComponent(query)}&display=20`
  const data = await getJson(url)
  const laws = data?.LawSearch?.law
  const list = Array.isArray(laws) ? laws : laws ? [laws] : []
  const exact = list.find((item) => item.법령명한글 === query) ?? list[0]
  return {
    query,
    id: exact?.법령ID || id,
    name: exact?.법령명한글,
    enforced: ymd(exact?.시행일자),
    promulgated: ymd(exact?.공포일자),
    revision: exact?.제개정구분명,
  }
}

async function fetchLawBody(id) {
  const url = `https://www.law.go.kr/DRF/lawService.do?OC=${encodeURIComponent(OC)}&target=law&type=JSON&ID=${id}`
  return getJson(url)
}

async function fetchAdmMeta(query) {
  const url = `https://www.law.go.kr/DRF/lawSearch.do?OC=${encodeURIComponent(OC)}&target=admrul&type=JSON&query=${encodeURIComponent(query)}&display=20`
  const data = await getJson(url)
  const list = [].concat(data?.AdmRulSearch?.admrul || [])
  const exact = list.find((item) => item.행정규칙명 === query) ?? list[0]
  const link = exact?.행정규칙상세링크 || ""
  const serviceId = (link.match(/ID=(\d+)/) || [])[1] || exact?.행정규칙ID
  return {
    query,
    id: serviceId || exact?.행정규칙ID,
    name: exact?.행정규칙명,
    enforced: ymd(exact?.시행일자),
    promulgated: ymd(exact?.발령일자),
    revision: exact?.제개정구분명,
  }
}

async function fetchAdmBody(id) {
  const url = `https://www.law.go.kr/DRF/lawService.do?OC=${encodeURIComponent(OC)}&target=admrul&type=JSON&ID=${id}`
  return getJson(url)
}

function admAttachmentUrl(body, prefer) {
  const files = body?.AdmRulService?.첨부파일 || {}
  const links = [].concat(files.첨부파일링크 || [])
  const names = [].concat(files.첨부파일명 || [])
  const idx = names.findIndex((name) => prefer(String(name)))
  return links[idx >= 0 ? idx : 0] || ""
}

async function fetchPdfText(url) {
  const urls = lawUrlFallbacks(url)
  let lastError
  for (const candidate of urls) {
    try {
      const res = await fetch(candidate, {
        headers: LAW_FETCH_HEADERS,
        signal: AbortSignal.timeout(25_000),
      })
      if (!res.ok) {
        lastError = new TransientFetchError(`PDF ${res.status} ${candidate}`, { status: res.status })
        continue
      }
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 100) throw new TransientFetchError(`빈 PDF ${candidate}`)
      return extractType3PdfText(buf)
    } catch (error) {
      lastError = wrapFetchError(error, candidate)
    }
  }
  throw lastError ?? new TransientFetchError(`PDF 실패 ${url}`)
}

function loadPrevious() {
  try {
    return JSON.parse(readFileSync(join(root, "public/policy.json"), "utf8"))
  } catch {
    return {}
  }
}

function reviveInf(rows, key) {
  return (rows || []).map((row) => ({
    ...row,
    [key]: row[key] == null ? Number.POSITIVE_INFINITY : row[key],
  }))
}

function jsonBands(rows) {
  return (rows || []).map((row) => ({
    ...row,
    max: row.max === Number.POSITIVE_INFINITY ? null : row.max,
    upTo: row.upTo === Number.POSITIVE_INFINITY ? null : row.upTo,
    cap: row.cap === Number.POSITIVE_INFINITY ? null : row.cap,
  }))
}

function tsBands(rows, keys = ["max", "rate", "cap"]) {
  return (rows || [])
    .map((row) => {
      const parts = keys.map((key) => {
        const value = row[key]
        if (value === Number.POSITIVE_INFINITY || (value == null && key !== "cap")) {
          return `${key}: Number.POSITIVE_INFINITY`
        }
        if (value == null) return `${key}: null`
        return `${key}: ${value}`
      })
      return `  { ${parts.join(", ")} }`
    })
    .join(",\n")
}

function tsSlice(rows) {
  return (rows || [])
    .map((row) => {
      const cap = row.cap === Number.POSITIVE_INFINITY ? "Number.POSITIVE_INFINITY" : row.cap
      return `  { cap: ${cap}, rate: ${row.rate} }`
    })
    .join(",\n")
}

function reviveRetirement(parsed, prev) {
  const src = parsed?.years?.length >= 4 && parsed?.converted?.length >= 5 ? parsed : prev
  if (!src?.years?.length) return null
  return {
    years: (src.years || []).map((row) => ({
      ...row,
      maxYears: row.maxYears == null ? Number.POSITIVE_INFINITY : row.maxYears,
    })),
    converted: (src.converted || []).map((row) => ({
      ...row,
      upTo: row.upTo === Number.POSITIVE_INFINITY || row.upTo == null ? Number.POSITIVE_INFINITY : row.upTo,
    })),
  }
}

function tsRetirement(p) {
  const y = (row) => {
    const max = row.maxYears === Number.POSITIVE_INFINITY ? "Number.POSITIVE_INFINITY" : row.maxYears
    return `    { maxYears: ${max}, base: ${row.base}, perYear: ${row.perYear}, offsetYears: ${row.offsetYears} }`
  }
  const c = (row) => {
    const up = row.upTo === Number.POSITIVE_INFINITY ? "Number.POSITIVE_INFINITY" : row.upTo
    return `    { upTo: ${up}, floor: ${row.floor}, intercept: ${row.intercept}, rate: ${row.rate} }`
  }
  return `{
  years: [
${p.years.map(y).join(",\n")},
  ],
  converted: [
${p.converted.map(c).join(",\n")},
  ],
}`
}

function jsonRetirement(p) {
  return {
    years: p.years.map((row) => ({
      ...row,
      maxYears: row.maxYears === Number.POSITIVE_INFINITY ? null : row.maxYears,
    })),
    converted: p.converted.map((row) => ({
      ...row,
      upTo: row.upTo === Number.POSITIVE_INFINITY ? null : row.upTo,
    })),
  }
}

function reviveParental(parsed, prev) {
  if (parsed?.floor && parsed.general?.length >= 3 && parsed.single?.length >= 3) return parsed
  const fallback = prev?.parentalLeave
  if (!fallback) return null
  const revive = (rows) =>
    (rows || []).map((row) => ({
      ...row,
      toMonth: row.toMonth == null ? Number.POSITIVE_INFINITY : row.toMonth,
    }))
  return {
    ...fallback,
    general: revive(fallback.general),
    single: revive(fallback.single),
  }
}

function tsParental(p) {
  const band = (row) => {
    const to = row.toMonth === Number.POSITIVE_INFINITY ? "Number.POSITIVE_INFINITY" : row.toMonth
    return `    { fromMonth: ${row.fromMonth}, toMonth: ${to}, rate: ${row.rate}, cap: ${row.cap} }`
  }
  return `{
  floor: ${p.floor},
  general: [
${p.general.map(band).join(",\n")},
  ],
  single: [
${p.single.map(band).join(",\n")},
  ],
  bothCapsFirst6: [${p.bothCapsFirst6.join(", ")}],
}`
}

export async function refreshPolicy() {
  const fetchedAt = todayStamp()
  const sources = {}
  for (const law of LAWS) {
    sources[law.key] = await fetchLawMeta(law.query, law.id)
  }

  const incomeBody = await fetchLawBody(sources.income.id)
  const giftBody = await fetchLawBody(sources.gift.id)
  const corpBody = await fetchLawBody(sources.corp.id)

  const incomeUnit = findArticle(incomeBody.법령.조문.조문단위, "55", "세율")
  const giftUnit = findArticle(giftBody.법령.조문.조문단위, "26", "상속세 세율")
  const giftDeductionUnit = findArticle(giftBody.법령.조문.조문단위, "53", "증여재산 공제")
  const corpUnit = findArticle(corpBody.법령.조문.조문단위, "55", "세율")

  const income = extractProgressive(articleText(incomeUnit))
  const gift = extractProgressive(articleText(giftUnit))
  const corp = extractProgressive(articleText(corpUnit))
  const giftDeductions = parseGiftDeductions(giftDeductionUnit)

  if (income.length < 6) throw new Error(`소득세 세율 파싱 실패 (${income.length})`)
  if (gift.length < 4) throw new Error(`상속·증여 세율 파싱 실패 (${gift.length})`)
  if (corp.length < 3) throw new Error(`법인세 세율 파싱 실패 (${corp.length})`)
  assertProgressiveConsistent(income, "소득세")
  assertProgressiveConsistent(gift, "상속·증여세")
  assertProgressiveConsistent(corp, "법인세")
  if (
    !giftDeductions.spouse ||
    !giftDeductions.ascendant ||
    !giftDeductions.descendant ||
    !giftDeductions.other
  ) {
    throw new Error(`증여재산 공제 파싱 실패 ${JSON.stringify(giftDeductions)}`)
  }

  const prev = loadPrevious()
  const localBody = await fetchLawBody(sources.local.id)
  const holdingBody = await fetchLawBody(sources.holding.id)
  const brokerageBody = await fetchLawBody(sources.brokerage.id)
  const firstHomeBody = await fetchLawBody(sources.firstHome.id)
  const stampBody = await fetchLawBody(sources.stamp.id)
  const vatBody = await fetchLawBody(sources.vat.id)
  const holdingDecreeBody = await fetchLawBody(sources.holdingDecree.id)
  const ruralBody = await fetchLawBody(sources.rural.id)
  const specialBody = await fetchLawBody(sources.specialTax.id)
  const laborBody = await fetchLawBody(sources.laborStd.id)
  const pensionBody = await fetchLawBody(sources.pension.id)
  const nhisDecreeBody = await fetchLawBody(sources.nhisDecree.id)
  const ltcDecreeBody = await fetchLawBody(sources.ltcDecree.id)
  const eiDecreeBody = await fetchLawBody(sources.eiPremiumDecree.id)
  const eiLeaveBody = await fetchLawBody(sources.eiLeaveDecree.id)
  const customsRuleBody = await fetchLawBody(sources.customsRule.id)
  const severanceBody = await fetchLawBody(sources.severanceLaw.id)

  sources.banking = await fetchAdmMeta("은행업감독규정")
  const bankingBody = sources.banking.id ? await fetchAdmBody(sources.banking.id) : null
  sources.pensionBase = await fetchAdmMeta("국민연금 기준소득월액 하한액과 상한액")
  const pensionNoticeBody = sources.pensionBase.id ? await fetchAdmBody(sources.pensionBase.id) : null
  sources.healthCap = await fetchAdmMeta("월별 건강보험료액의 상한과 하한에 관한 고시")
  const healthCapBody = sources.healthCap.id ? await fetchAdmBody(sources.healthCap.id) : null
  sources.expressNotice = await fetchAdmMeta("특송물품 수입통관 사무처리에 관한 고시")
  const expressBody = sources.expressNotice.id ? await fetchAdmBody(sources.expressNotice.id) : null
  const yearStamp = fetchedAt.slice(0, 4)
  sources.minWageNotice = await fetchAdmMeta(`${yearStamp}년 적용 최저임금 고시`)
  if (sources.minWageNotice.enforced && sources.minWageNotice.enforced > fetchedAt) {
    sources.minWageNotice = await fetchAdmMeta(`${Number(yearStamp) - 1}년 적용 최저임금 고시`)
  }
  const minWageBody = sources.minWageNotice.id ? await fetchAdmBody(sources.minWageNotice.id) : null
  sources.maternityCapNotice = await fetchAdmMeta("출산전후휴가 급여등 상한액 고시")
  const maternityCapBody = sources.maternityCapNotice.id
    ? await fetchAdmBody(sources.maternityCapNotice.id)
    : null
  const eiLawBody = await fetchLawBody(sources.eiLaw.id)

  const vatRate =
    parseVatRate(articleText(findArticle(vatBody.법령.조문.조문단위, "30", "세율"))) ??
    prev.vatRate ??
    0.1

  const houseApp = appendixByTitle(brokerageBody, "주택 중개보수")
  const officeApp = appendixByTitle(brokerageBody, "오피스텔 중개보수")
  const houseBands = parseBrokerageHouse(houseApp?.별표내용 || "")
  const officeRates = parseBrokerageOfficetel(officeApp?.별표내용 || "")
  const rule20 = findArticle(brokerageBody.법령.조문.조문단위, "20")
  const rule20Text = articleText(rule20)
  const otherRate =
    parsePerMilleOrPercent((rule20Text.match(/제1호 외의 경우[\s\S]{0,80}1천분의\s*\d+/) || [])[0] || "") ??
    prev.brokerage?.other ??
    0.009
  const monthlyHigh = /차임액에\s*100을 곱한/.test(rule20Text) ? 100 : prev.brokerage?.monthlyHighMultiple ?? 100
  const monthlyLow = /차임액에\s*70을 곱한/.test(rule20Text) ? 70 : prev.brokerage?.monthlyLowMultiple ?? 70
  const monthlyThreshold =
    parseWonAfter(rule20Text, "합산한 금액이") ?? prev.brokerage?.monthlyLowThreshold ?? 50_000_000
  const brokerage = {
    sale: houseBands.sale.length >= 4 ? houseBands.sale : reviveInf(prev.brokerage?.sale, "max"),
    lease: houseBands.lease.length >= 4 ? houseBands.lease : reviveInf(prev.brokerage?.lease, "max"),
    officetelSale: officeRates.sale ?? prev.brokerage?.officetelSale ?? 0.005,
    officetelLease: officeRates.lease ?? prev.brokerage?.officetelLease ?? 0.004,
    other: otherRate,
    monthlyHighMultiple: monthlyHigh,
    monthlyLowMultiple: monthlyLow,
    monthlyLowThreshold: monthlyThreshold,
  }
  if (!brokerage.sale || brokerage.sale.length < 4) {
    brokerage.sale = prev.brokerage?.sale ?? [
      { max: 50_000_000, rate: 0.006, cap: 250_000 },
      { max: 200_000_000, rate: 0.005, cap: 800_000 },
      { max: 900_000_000, rate: 0.004, cap: null },
      { max: 1_200_000_000, rate: 0.005, cap: null },
      { max: 1_500_000_000, rate: 0.006, cap: null },
      { max: Number.POSITIVE_INFINITY, rate: 0.007, cap: null },
    ]
  }
  if (!brokerage.lease || brokerage.lease.length < 4) {
    brokerage.lease = prev.brokerage?.lease ?? [
      { max: 50_000_000, rate: 0.005, cap: 200_000 },
      { max: 100_000_000, rate: 0.004, cap: 300_000 },
      { max: 600_000_000, rate: 0.003, cap: null },
      { max: 1_200_000_000, rate: 0.004, cap: null },
      { max: 1_500_000_000, rate: 0.005, cap: null },
      { max: Number.POSITIVE_INFINITY, rate: 0.006, cap: null },
    ]
  }

  const stamp3 = findArticle(stampBody.법령.조문.조문단위, "3", "과세문서 및 세액")
  const stamp6 = findArticle(stampBody.법령.조문.조문단위, "6", "비과세문서")
  const stampBands = parseStampBands(articleText(stamp3))
  const stamp = {
    housingExempt: parseHousingExempt(articleText(stamp6)) ?? prev.stamp?.housingExempt ?? 100_000_000,
    bands: stampBands.length >= 4 ? stampBands : prev.stamp?.bands,
  }
  if (!stamp.bands || stamp.bands.length < 4) {
    stamp.bands = prev.stamp?.bands ?? [
      { upTo: 10_000_000, duty: 0 },
      { upTo: 30_000_000, duty: 20_000 },
      { upTo: 50_000_000, duty: 40_000 },
      { upTo: 100_000_000, duty: 70_000 },
      { upTo: 1_000_000_000, duty: 150_000 },
      { upTo: Number.POSITIVE_INFINITY, duty: 350_000 },
    ]
  }

  const localUnits = localBody.법령.조문.조문단위
  const acq11 = findArticle(localUnits, "11", "부동산 취득의 세율")
  const acq11Text = articleText(acq11)
  const housingLow = parsePerMilleOrPercent((acq11Text.match(/6억원 이하인 주택[\s\S]{0,40}1천분의\s*\d+/) || [])[0] || "")
  const housingHigh = parsePerMilleOrPercent((acq11Text.match(/9억원을 초과하는 주택[\s\S]{0,40}1천분의\s*\d+/) || [])[0] || "")
  const nonFarm = [...acq11Text.matchAll(/농지 외의 것:\s*1천분의\s*(\d+)/g)]
  const standardNonFarm = nonFarm.length
    ? Number(nonFarm[nonFarm.length - 1][1]) / 1000
    : parsePerMilleOrPercent((acq11Text.match(/농지 외의 것:\s*1천분의\s*\d+/) || [])[0] || "")
  const def6 = findArticle(localUnits, "6", "정의")
  const heavyBase = parsePerMilleOrPercent((articleText(def6).match(/중과기준세율[\s\S]{0,80}1천분의\s*\d+/) || [])[0] || "")
  const heavy13 = findArticle(localUnits, "13", "법인의 주택 취득 등 중과", "2")
  const heavy13Text = articleText(heavy13)
  const heavy2Mul = Number((heavy13Text.match(/100분의\s*(\d+)을 합한 세율[\s\S]{0,40}1세대 3주택/) || heavy13Text.match(/100분의\s*(200)/) || [])[1] || 200) / 100
  const heavy3Mul = Number((heavy13Text.match(/100분의\s*(400)/) || [])[1] || 400) / 100
  const firstHomeUnit = findArticle(firstHomeBody.법령.조문.조문단위, "36", "생애최초 주택 구입에 대한 취득세 감면", "3")
  const firstHomeText = articleText(firstHomeUnit)
  const firstHomeLimit = parseWonAfter(firstHomeText, "취득당시가액") ?? 1_200_000_000
  const shrinkingRelief = parseWonAfter(firstHomeText, "산출세액이") ?? 3_000_000
  const generalRelief = parseWonAfter(firstHomeText, "제1호 외의 주택") ?? 2_000_000
  const license28 = findArticle(localUnits, "28", "세율")
  const licenseText = articleText(license28)
  const inheritRate = parsePerMilleOrPercent((licenseText.match(/상속으로 인한 소유권 이전[\s\S]{0,40}1천분의\s*\d+/) || [])[0] || "")
  const giftRate = parsePerMilleOrPercent((licenseText.match(/무상으로 인한 소유권 이전[\s\S]{0,40}1천분의\s*\d+/) || [])[0] || "")
  const city112 = findArticle(localUnits, "112", "재산세 도시지역분")
  const cityRate = parsePerMilleOrPercent((articleText(city112).match(/1천분의\s*1\.4/) || [])[0] || "") ?? prev.holding?.cityRate ?? 0.0014
  const propOne = extractSliceRates(articleText(findArticle(localUnits, "111", "1세대 1주택에 대한 주택 세율 특례", "2")))
  const propOther = extractSliceRates(articleText(findArticle(localUnits, "111", "세율")))
  const housingOther = propOther.filter((row, idx, all) => {
    const firstInf = all.findIndex((item) => item.cap === Number.POSITIVE_INFINITY)
    return idx >= Math.max(0, all.length - 8)
  })
  const otherSlice = propOther.slice(-4)
  const acquisition = {
    housingLow: housingLow ?? prev.acquisition?.housingLow ?? 0.01,
    housingHigh: housingHigh ?? prev.acquisition?.housingHigh ?? 0.03,
    housingMidFrom: 600_000_000,
    housingMidTo: 900_000_000,
    standardNonFarm: standardNonFarm ?? prev.acquisition?.standardNonFarm ?? 0.04,
    heavyBase: heavyBase ?? prev.acquisition?.heavyBase ?? 0.02,
    heavy2: (standardNonFarm ?? 0.04) + (heavyBase ?? 0.02) * (heavy2Mul || 2),
    heavy3: (standardNonFarm ?? 0.04) + (heavyBase ?? 0.02) * (heavy3Mul || 4),
    firstHomeLimit,
    firstHomeRelief: generalRelief,
    shrinkingRelief,
    educationShare: 0.1,
    educationHeavyFixed: 0.004,
    ruralNormal: 0.002,
    ruralHeavy2: 0.006,
    ruralHeavy3: 0.01,
  }

  const income89 = findArticle(incomeBody.법령.조문.조문단위, "89", "비과세 양도소득")
  const income103 = findArticle(incomeBody.법령.조문.조문단위, "103", "양도소득 기본공제")
  const income104 = findArticle(incomeBody.법령.조문.조문단위, "104", "양도소득세의 세율")
  const income95 = findArticle(incomeBody.법령.조문.조문단위, "95", "양도소득금액과 장기보유 특별공제액")
  const t89 = articleText(income89)
  const t103 = articleText(income103)
  const t104 = articleText(income104)
  const t95 = articleText(income95)
  const under1 = Number((t104.match(/1년 미만인 것[\s\S]{0,80}주택[\s\S]{0,40}100분의\s*(\d+)/) || [])[1] || 70) / 100
  const under2 = Number((t104.match(/1년 이상 2년 미만[\s\S]{0,80}주택[\s\S]{0,40}100분의\s*(\d+)/) || [])[1] || 60) / 100
  const capitalGains = {
    houseExempt: parseWonAfter(t89, "합계액이") ?? prev.capitalGains?.houseExempt ?? 1_200_000_000,
    basicDeduction: parseWonAfter(t103, "연") ?? prev.capitalGains?.basicDeduction ?? 2_500_000,
    under1y: under1,
    under2y: under2,
    surcharge2: prev.capitalGains?.surcharge2 ?? 0.2,
    surcharge3: prev.capitalGains?.surcharge3 ?? 0.3,
    localIncome: 0.1,
    specialStart: /100분의 6/.test(t95) ? 0.06 : 0.06,
    specialStep: 0.02,
    specialMax: /100분의 30/.test(t95) ? 0.3 : 0.3,
    specialOneHousePerYear: 0.08,
    specialOneHouseMax: 0.8,
  }

  const giftUnits = giftBody.법령.조문.조문단위
  const gift18 = findArticle(giftUnits, "18", "기초공제")
  const gift21 = findArticle(giftUnits, "21", "일괄공제")
  const gift19 = findArticle(giftUnits, "19", "배우자 상속공제")
  const gift20 =
    findArticle(giftUnits, "20", "인적공제") ??
    (Array.isArray(giftUnits)
      ? giftUnits.find((unit) => String(unit.조문번호) === "20" && !unit.조문가지번호)
      : null)
  const gift22 =
    findArticle(giftUnits, "22", "금융재산 상속공제") ??
    findArticle(giftUnits, "22", "금융재산공제") ??
    (Array.isArray(giftUnits)
      ? giftUnits.find((unit) => String(unit.조문번호) === "22" && !unit.조문가지번호)
      : null)
  const lump = parseWonAfter(articleText(gift21), "5억원") ?? 500_000_000
  const spouseMin = parseWonAfter(articleText(gift19), "5억원") ?? 500_000_000
  const spouseMax = parseWonAfter(articleText(gift19), "30억원") ?? prev.inheritance?.spouseMax ?? 3_000_000_000
  const basic = parseWonAfter(articleText(gift18), "2억원") ?? prev.inheritance?.basic ?? 200_000_000
  const personal = parseInheritancePersonal(articleText(gift20))
  const finance = parseInheritanceFinance(articleText(gift22))
  const inheritance = {
    lump,
    spouseMin,
    spouseMax,
    basic,
    child: personal.child ?? prev.inheritance?.child ?? 50_000_000,
    minorPerYear: personal.minorPerYear ?? prev.inheritance?.minorPerYear ?? 10_000_000,
    minorAgeCap: personal.minorAgeCap ?? prev.inheritance?.minorAgeCap ?? 19,
    elderly: personal.elderly ?? prev.inheritance?.elderly ?? 50_000_000,
    financeFull: finance.full ?? prev.inheritance?.financeFull ?? 20_000_000,
    financeRate: finance.rate ?? prev.inheritance?.financeRate ?? 0.2,
    financeFloor: finance.floor ?? prev.inheritance?.financeFloor ?? 20_000_000,
    financeCap: finance.cap ?? prev.inheritance?.financeCap ?? 200_000_000,
  }

  const income48 = findArticle(incomeBody.법령.조문.조문단위, "48", "퇴직소득공제")
  const retirement = reviveRetirement(parseRetirementDeductions(articleText(income48)), prev.retirement)

  const holding8 = findArticle(holdingBody.법령.조문.조문단위, "8", "과세표준")
  const holding8Text = articleText(holding8)
  const oneHouseDeduction = parseWonAfter(holding8Text, "1세대 1주택자") ?? 1_200_000_000
  const otherDeduction = parseWonAfter(holding8Text, "해당하지 아니하는 자") ?? 900_000_000
  const fairMarket =
    parsePerMilleOrPercent((articleText(findArticle(holdingDecreeBody.법령.조문.조문단위, "2", "공정시장가액비율", "4")).match(/100분의\s*60/) || [])[0] || "") ??
    0.6
  const holding = {
    fairMarket,
    oneHouseDeduction,
    otherDeduction,
    cityRate,
    educationShare: 0.2,
    ruralShare: 0.2,
    jongbuOne: 0.005,
    jongbuTwo: 0.008,
    jongbuThree: 0.012,
    propertyOneHouse: propOne.length >= 3 ? propOne : prev.holding?.propertyOneHouse,
    propertyOther: otherSlice.length >= 3 ? otherSlice : prev.holding?.propertyOther,
  }
  if (!holding.propertyOneHouse || holding.propertyOneHouse.length < 3) {
    holding.propertyOneHouse = prev.holding?.propertyOneHouse ?? [
      { cap: 60_000_000, rate: 0.0005 },
      { cap: 150_000_000, rate: 0.001 },
      { cap: 300_000_000, rate: 0.002 },
      { cap: Number.POSITIVE_INFINITY, rate: 0.0035 },
    ]
  }
  if (!holding.propertyOther || holding.propertyOther.length < 3) {
    holding.propertyOther = prev.holding?.propertyOther ?? [
      { cap: 60_000_000, rate: 0.001 },
      { cap: 150_000_000, rate: 0.0015 },
      { cap: 300_000_000, rate: 0.0025 },
      { cap: Number.POSITIVE_INFINITY, rate: 0.004 },
    ]
  }

  const license = {
    inherit: inheritRate ?? prev.license?.inherit ?? 0.008,
    gift: giftRate ?? prev.license?.gift ?? 0.015,
    educationShare: 0.2,
  }

  const corpExtraUnit = findArticle(corpBody.법령.조문.조문단위, "55", "토지등 양도소득에 대한 과세특례", "2")
  const corpExtra =
    parsePerMilleOrPercent((articleText(corpExtraUnit).match(/비사업용[\s\S]{0,80}100분의\s*\d+/) || articleText(corpExtraUnit).match(/100분의\s*10/) || [])[0] || "") ??
    prev.corpExtraLand ??
    0.1

  const ltvParsed = parseLtvFromBanking(appendixByTitle(bankingBody, "주택 관련 담보대출")?.별표내용 || "")
  const ltv = {
    unregulated: ltvParsed.unregulated ?? prev.ltv?.unregulated ?? 0.7,
    regulated: ltvParsed.regulated ?? prev.ltv?.regulated ?? 0.4,
    firstTime: ltvParsed.firstTime ?? prev.ltv?.firstTime ?? 0.8,
    firstTimeCap: ltvParsed.firstTimeCap ?? prev.ltv?.firstTimeCap ?? 600_000_000,
    extraBanned: true,
  }
  const dsr = {
    bank: ltvParsed.dsrBank ?? prev.dsr?.bank ?? 0.4,
    nonbank: prev.dsr?.nonbank ?? 0.5,
  }

  const year = Number(fetchedAt.slice(0, 4))
  const rentParsed = parseRentCredit(
    articleText(findArticle(specialBody.법령.조문.조문단위, "95", "월세액에 대한 세액공제", "2")),
  )
  const rentCredit = {
    salaryCap: rentParsed?.salaryCap ?? prev.rentCredit?.salaryCap ?? 80_000_000,
    salaryHighRate: rentParsed?.salaryHighRate ?? prev.rentCredit?.salaryHighRate ?? 55_000_000,
    incomeCap: rentParsed?.incomeCap ?? prev.rentCredit?.incomeCap ?? 70_000_000,
    incomeHighRate: rentParsed?.incomeHighRate ?? prev.rentCredit?.incomeHighRate ?? 45_000_000,
    rentCap: rentParsed?.rentCap ?? prev.rentCredit?.rentCap ?? 10_000_000,
    rate: rentParsed?.rate ?? prev.rentCredit?.rate ?? 0.15,
    rateLow: rentParsed?.rateLow ?? prev.rentCredit?.rateLow ?? 0.17,
  }

  const carParsed = parseCarTax(articleText(findArticle(localUnits, "127", "과세표준과 세율")))
  const carEdu = parseCarTaxEducation(articleText(findArticle(localUnits, "151")))
  const carTax = {
    private: carParsed?.private ?? prev.carTax?.private ?? [
      { maxCc: 1000, perCc: 80 },
      { maxCc: 1600, perCc: 140 },
      { maxCc: Number.POSITIVE_INFINITY, perCc: 200 },
    ],
    commercial: carParsed?.commercial ?? prev.carTax?.commercial ?? [
      { maxCc: 1000, perCc: 18 },
      { maxCc: 1600, perCc: 18 },
      { maxCc: 2000, perCc: 19 },
      { maxCc: 2500, perCc: 19 },
      { maxCc: Number.POSITIVE_INFINITY, perCc: 24 },
    ],
    evPrivate: carParsed?.evPrivate ?? prev.carTax?.evPrivate ?? 100_000,
    education: carEdu ?? prev.carTax?.education ?? 0.3,
  }

  const laborParsed = parseLaborHours(
    articleText(findArticle(laborBody.법령.조문.조문단위, "18", "단시간근로자의 근로조건")),
    articleText(findArticle(laborBody.법령.조문.조문단위, "50", "근로시간")),
    articleText(findArticle(laborBody.법령.조문.조문단위, "60", "연차 유급휴가")),
  )
  const severanceDays =
    parseSeveranceDays(articleText(findArticle(severanceBody.법령.조문.조문단위, "8"))) ??
    prev.laborStatute?.severanceDays ??
    30
  const laborStatute = {
    weeklyFullHours: laborParsed?.weeklyFullHours ?? prev.laborStatute?.weeklyFullHours ?? 40,
    dailyHours: laborParsed?.dailyHours ?? prev.laborStatute?.dailyHours ?? 8,
    shortHourThreshold: laborParsed?.shortHourThreshold ?? prev.laborStatute?.shortHourThreshold ?? 15,
    annualLeaveBase: laborParsed?.annualLeaveBase ?? prev.laborStatute?.annualLeaveBase ?? 15,
    annualLeaveCap: laborParsed?.annualLeaveCap ?? prev.laborStatute?.annualLeaveCap ?? 25,
    severanceDays,
  }

  const pensionBase = parsePensionBase(admText(pensionNoticeBody))
  const pensionRate = parsePensionEmployeeRate(
    `${JSON.stringify(pensionBody.법령?.부칙 || "")}\n${articleText(findArticle(pensionBody.법령.조문.조문단위, "88", "연금보험료의 부과ㆍ징수 등"))}`,
    year,
  )
  const healthTotal = parseHealthWorkplaceRate(
    articleText(findArticle(nhisDecreeBody.법령.조문.조문단위, "44", "보험료율 및 재산보험료부과점수당 금액")),
  )
  const ltcIncome = parseLongTermCareRate(
    articleText(findArticle(ltcDecreeBody.법령.조문.조문단위, "4", "장기요양보험료율")),
  )
  const unempTotal = parseEmploymentUnempRate(
    articleText(findArticle(eiDecreeBody.법령.조문.조문단위, "12", "고용보험료율")),
  )
  const healthCapParsed = parseHealthCapNotice(admText(healthCapBody))
  const healthEmployeeRate = healthTotal != null ? healthTotal / 2 : prev.payrollInsurance?.healthEmployeeRate ?? 0.03595
  const payrollInsurance = {
    year,
    pensionEmployeeRate: pensionRate ?? prev.payrollInsurance?.pensionEmployeeRate ?? 0.0475,
    pensionFloor: pensionBase?.floor ?? prev.payrollInsurance?.pensionFloor ?? 410_000,
    pensionCeil: pensionBase?.ceil ?? prev.payrollInsurance?.pensionCeil ?? 6_590_000,
    healthEmployeeRate,
    longTermCareOfHealth:
      ltcIncome != null && healthTotal
        ? Number((ltcIncome / healthTotal).toFixed(4))
        : prev.payrollInsurance?.longTermCareOfHealth ?? 0.1314,
    employmentEmployeeRate: unempTotal != null ? unempTotal / 2 : prev.payrollInsurance?.employmentEmployeeRate ?? 0.009,
    healthEmployeeCap: healthCapParsed ? healthCapParsed.totalCap / 2 : prev.payrollInsurance?.healthEmployeeCap ?? 4_591_740,
    healthFloor: healthCapParsed?.floor ?? prev.payrollInsurance?.healthFloor ?? 20_160,
  }

  const vehicleRates = parseVehicleAcquisition(articleText(findArticle(localUnits, "12")))
  const vehicleEdu = parseVehicleEducation(articleText(findArticle(localUnits, "151")))
  const compactParsed = parseCompactRelief(
    articleText(findArticle(firstHomeBody.법령.조문.조문단위, "67")),
  )
  const vehicleAcquisition = {
    passenger: vehicleRates?.passenger ?? prev.vehicleAcquisition?.passenger ?? 0.07,
    compact: vehicleRates?.compact ?? prev.vehicleAcquisition?.compact ?? 0.04,
    otherPrivate: vehicleRates?.otherPrivate ?? prev.vehicleAcquisition?.otherPrivate ?? 0.05,
    commercial: vehicleRates?.commercial ?? prev.vehicleAcquisition?.commercial ?? 0.04,
    educationOffset: vehicleEdu?.offset ?? prev.vehicleAcquisition?.educationOffset ?? 0.02,
    educationShare: vehicleEdu?.share ?? prev.vehicleAcquisition?.educationShare ?? 0.2,
    compactRelief: compactParsed?.relief ?? prev.vehicleAcquisition?.compactRelief ?? 750_000,
    compactUntil: compactParsed?.until ?? prev.vehicleAcquisition?.compactUntil ?? "2027-12-31",
  }

  const overtimeParsed = parseOvertime(
    articleText(findArticle(laborBody.법령.조문.조문단위, "56")),
  )
  const overtimeStatute = {
    overtimePremium: overtimeParsed?.overtimePremium ?? prev.overtimeStatute?.overtimePremium ?? 0.5,
    holidayPremium: overtimeParsed?.holidayPremium ?? prev.overtimeStatute?.holidayPremium ?? 0.5,
    holidayOverPremium: overtimeParsed?.holidayOverPremium ?? prev.overtimeStatute?.holidayOverPremium ?? 1,
    nightPremium: overtimeParsed?.nightPremium ?? prev.overtimeStatute?.nightPremium ?? 0.5,
    holidaySplitHours: overtimeParsed?.holidaySplitHours ?? prev.overtimeStatute?.holidaySplitHours ?? 8,
  }

  const interestNational =
    parseInterestNationalRate(articleText(findArticle(incomeBody.법령.조문.조문단위, "129"))) ??
    prev.interestTax?.national ??
    0.14
  const localShare =
    parseLocalWithholdingShare(
      articleText(findArticle(localUnits, "103", "특별징수의무", "13")),
    ) ??
    prev.interestTax?.localShare ??
    0.1
  const interestTax = {
    national: interestNational,
    localShare,
    withholding: Number((interestNational * (1 + localShare)).toFixed(3)),
  }

  const youthParsed = parseYouthRelief(
    articleText(findArticle(specialBody.법령.조문.조문단위, "30")),
  )
  const mealExempt =
    parseMealExempt(articleText(findArticle(incomeBody.법령.조문.조문단위, "12"))) ??
    prev.payrollDeductions?.mealExemptMonthly ??
    200_000
  const basicPerson =
    parseBasicPersonDeduction(articleText(findArticle(incomeBody.법령.조문.조문단위, "50"))) ??
    prev.payrollDeductions?.basicPersonDeduction ??
    1_500_000
  const earnedCap =
    parseEarnedDeductionCap(articleText(findArticle(incomeBody.법령.조문.조문단위, "47"))) ??
    prev.payrollDeductions?.earnedDeductionCap ??
    20_000_000
  const bizNational =
    parseBizWithholding(articleText(findArticle(incomeBody.법령.조문.조문단위, "129"))) ??
    prev.payrollDeductions?.bizWithholdingNational ??
    0.03
  const payrollDeductions = {
    youthReliefRate: youthParsed?.rate ?? prev.payrollDeductions?.youthReliefRate ?? 0.9,
    youthReliefCap: youthParsed?.cap ?? prev.payrollDeductions?.youthReliefCap ?? 2_000_000,
    mealExemptMonthly: mealExempt,
    basicPersonDeduction: basicPerson,
    localIncomeRate: localShare,
    bizWithholdingNational: bizNational,
    bizWithholdingLocal: Number((bizNational * localShare).toFixed(3)),
    earnedDeductionCap: earnedCap,
  }

  const parentalParsed = parseParentalLeave(
    articleText(findArticle(eiLeaveBody.법령.조문.조문단위, "95")),
    articleText(findArticle(eiLeaveBody.법령.조문.조문단위, "95", null, "3")),
  )
  const parentalLeave = reviveParental(parentalParsed, prev) ?? {
    floor: 700_000,
    general: [
      { fromMonth: 1, toMonth: 3, rate: 1, cap: 2_500_000 },
      { fromMonth: 4, toMonth: 6, rate: 1, cap: 2_000_000 },
      { fromMonth: 7, toMonth: Number.POSITIVE_INFINITY, rate: 0.8, cap: 1_600_000 },
    ],
    single: [
      { fromMonth: 1, toMonth: 3, rate: 1, cap: 3_000_000 },
      { fromMonth: 4, toMonth: 6, rate: 1, cap: 2_000_000 },
      { fromMonth: 7, toMonth: Number.POSITIVE_INFINITY, rate: 0.8, cap: 1_600_000 },
    ],
    bothCapsFirst6: [2_500_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000, 4_500_000],
  }

  let minWageText = admText(minWageBody)
  if (!parseMinWageNotice(minWageText)) {
    const pdfUrl = admAttachmentUrl(
      minWageBody,
      (name) => name.includes("고시") && name.toLowerCase().endsWith(".pdf") && !name.includes("이유"),
    )
    if (pdfUrl) {
      try {
        minWageText = await fetchPdfText(pdfUrl)
      } catch (error) {
        if (!isTransientFetchError(error)) throw error
      }
    }
  }
  const minWage =
    parseMinWageNotice(minWageText) ??
    prev.minWage ?? {
      year: 2026,
      hourly: 10_320,
      monthly: 2_156_880,
      monthlyHours: 209,
      weeklyHours: 40,
      weeklyHolidayHours: 8,
      from: "2026-01-01",
      to: "2026-12-31",
    }

  const laborMaternity =
    parseLaborMaternity(articleText(findArticle(laborBody.법령.조문.조문단위, "74"))) ?? prev.maternityLeave
  const eiMaternity =
    parseEiMaternity(articleText(findArticle(eiLawBody.법령.조문.조문단위, "76"))) ?? prev.maternityLeave
  const maternityCap =
    parseMaternityCapNotice(admText(maternityCapBody)) ?? prev.maternityLeave
  const maternityLeave = {
    days: laborMaternity?.days ?? prev.maternityLeave?.days ?? { standard: 90, preterm: 100, multiple: 120 },
    employerPaidDays:
      laborMaternity?.employerPaidDays ?? prev.maternityLeave?.employerPaidDays ?? { standard: 60, multiple: 75 },
    afterBirthMinDays:
      laborMaternity?.afterBirthMinDays ??
      prev.maternityLeave?.afterBirthMinDays ?? { standard: 45, multiple: 60 },
    nonPriorityPaidDays:
      eiMaternity?.nonPriorityPaidDays ??
      prev.maternityLeave?.nonPriorityPaidDays ?? { standard: 60, multiple: 75 },
    eiExtraCapDays:
      eiMaternity?.eiExtraCapDays ??
      prev.maternityLeave?.eiExtraCapDays ?? { standard: 30, preterm: 40, multiple: 45 },
    cap: maternityCap?.cap ?? prev.maternityLeave?.cap ?? {
      standard: 6_600_000,
      preterm: 7_333_330,
      multiple: 8_800_000,
    },
    capDays: maternityCap?.capDays ?? prev.maternityLeave?.capDays ?? {
      standard: 90,
      preterm: 100,
      multiple: 120,
    },
  }

  const deMinimisUsd =
    parseDeMinimisUsd(articleText(findArticle(customsRuleBody.법령.조문.조문단위, "45"))) ??
    prev.importClearance?.deMinimisUsd ??
    150
  const listParsed = parseListClearance(admText(expressBody))
  const importClearance = {
    listUsd: listParsed?.listUsd ?? prev.importClearance?.listUsd ?? 150,
    listUsUsd: listParsed?.listUsUsd ?? prev.importClearance?.listUsUsd ?? 200,
    deMinimisUsd,
  }

  if (process.env.POLICY_STRICT === "1") {
    if (!rentParsed?.salaryCap) throw new Error("월세 세액공제 파싱 실패")
    if (!carParsed?.private) throw new Error("자동차세 파싱 실패")
    if (!laborParsed?.weeklyFullHours) throw new Error("근로기준법 시간·연차 파싱 실패")
    if (!pensionBase?.ceil || pensionRate == null) throw new Error("국민연금 고시·요율 파싱 실패")
    if (healthTotal == null || ltcIncome == null || unempTotal == null || !healthCapParsed) {
      throw new Error("4대보험 요율·상한 파싱 실패")
    }
    if (!vehicleRates?.passenger || vehicleEdu?.offset == null || !compactParsed?.relief) {
      throw new Error("자동차 취득세·교육세·경형 감면 파싱 실패")
    }
    if (!overtimeParsed?.overtimePremium) throw new Error("연장·야간·휴일 수당 파싱 실패")
    if (parseInterestNationalRate(articleText(findArticle(incomeBody.법령.조문.조문단위, "129"))) == null) {
      throw new Error("이자소득 원천징수 세율 파싱 실패")
    }
    if (
      parseLocalWithholdingShare(articleText(findArticle(localUnits, "103", "특별징수의무", "13"))) ==
      null
    ) {
      throw new Error("지방소득세 특별징수 비율 파싱 실패")
    }
    if (!youthParsed?.rate || mealExempt == null || basicPerson == null || earnedCap == null) {
      throw new Error("급여 공제·청년감면·식사대 파싱 실패")
    }
    if (parseBizWithholding(articleText(findArticle(incomeBody.법령.조문.조문단위, "129"))) == null) {
      throw new Error("사업소득 원천징수 세율 파싱 실패")
    }
    if (parseSeveranceDays(articleText(findArticle(severanceBody.법령.조문.조문단위, "8"))) == null) {
      throw new Error("퇴직금 일수 파싱 실패")
    }
    if (!parentalParsed?.floor) throw new Error("육아휴직 급여 파싱 실패")
    if (!parseMinWageNotice(minWageText)) throw new Error("최저임금 고시 파싱 실패")
    if (!laborMaternity?.days || !eiMaternity?.eiExtraCapDays || !maternityCap?.cap) {
      throw new Error("출산전후휴가 일수·상한 파싱 실패")
    }
    if (!listParsed?.listUsd || deMinimisUsd == null) throw new Error("목록통관·소액면세 파싱 실패")
  }

  if (!retirement?.years || retirement.years.length < 4 || retirement.converted.length < 5) {
    throw new Error("퇴직소득공제 파싱 실패")
  }

  const json = {
    fetchedAt,
    source: "법제처 국가법령정보 공동활용",
    sources,
    income: income.map(({ upTo, rate, deduction }) => ({
      upTo: upTo === Number.POSITIVE_INFINITY ? null : upTo,
      rate,
      deduction,
    })),
    gift: gift.map(({ upTo, rate, deduction }) => ({
      upTo: upTo === Number.POSITIVE_INFINITY ? null : upTo,
      rate,
      deduction,
    })),
    corp: corp.map(({ upTo, rate, deduction }) => ({
      upTo: upTo === Number.POSITIVE_INFINITY ? null : upTo,
      rate,
      deduction,
    })),
    giftDeductions,
    vatRate,
    brokerage: {
      ...brokerage,
      sale: jsonBands(brokerage.sale),
      lease: jsonBands(brokerage.lease),
    },
    stamp: { ...stamp, bands: jsonBands(stamp.bands) },
    acquisition,
    capitalGains,
    inheritance,
    retirement: retirement ? jsonRetirement(retirement) : null,
    holding: {
      ...holding,
      propertyOneHouse: jsonBands(holding.propertyOneHouse),
      propertyOther: jsonBands(holding.propertyOther),
    },
    license,
    corpExtraLand: corpExtra,
    ltv,
    dsr,
    rentCredit,
    carTax: {
      ...carTax,
      private: carTax.private.map((row) => ({
        maxCc: row.maxCc === Number.POSITIVE_INFINITY ? null : row.maxCc,
        perCc: row.perCc,
      })),
      commercial: carTax.commercial.map((row) => ({
        maxCc: row.maxCc === Number.POSITIVE_INFINITY ? null : row.maxCc,
        perCc: row.perCc,
      })),
    },
    laborStatute,
    payrollInsurance,
    vehicleAcquisition,
    overtimeStatute,
    interestTax,
    payrollDeductions,
    parentalLeave: {
      ...parentalLeave,
      general: parentalLeave.general.map((row) => ({
        ...row,
        toMonth: row.toMonth === Number.POSITIVE_INFINITY ? null : row.toMonth,
      })),
      single: parentalLeave.single.map((row) => ({
        ...row,
        toMonth: row.toMonth === Number.POSITIVE_INFINITY ? null : row.toMonth,
      })),
    },
    minWage,
    maternityLeave,
    importClearance,
  }

  mkdirSync(join(root, "public"), { recursive: true })
  writeFileSync(join(root, "public/policy.json"), `${JSON.stringify(json, null, 2)}\n`)

  const ts = `/* 자동 생성. scripts/refresh-policy.mjs 가 법제처·금융위 규정에서 다시 씁니다. */
export const POLICY_FETCHED_AT = ${JSON.stringify(fetchedAt)}

export const POLICY_SOURCES = ${JSON.stringify(sources, null, 2)} as const

export const INCOME_BRACKETS = [
${tsLiteral(income)},
] as const

export const GIFT_BRACKETS = [
${tsLiteral(gift)},
] as const

export const CORP_BRACKETS = [
${tsLiteral(corp)},
] as const

export const GIFT_DEDUCTIONS = {
  spouse: ${giftDeductions.spouse},
  ascendant: ${giftDeductions.ascendant},
  descendant: ${giftDeductions.descendant},
  other: ${giftDeductions.other},
} as const

export const VAT_RATE = ${vatRate}

export const BROKERAGE_SALE = [
${tsBands(brokerage.sale)},
] as const

export const BROKERAGE_LEASE = [
${tsBands(brokerage.lease)},
] as const

export const BROKERAGE = {
  officetelSale: ${brokerage.officetelSale},
  officetelLease: ${brokerage.officetelLease},
  other: ${brokerage.other},
  monthlyHighMultiple: ${brokerage.monthlyHighMultiple},
  monthlyLowMultiple: ${brokerage.monthlyLowMultiple},
  monthlyLowThreshold: ${brokerage.monthlyLowThreshold},
} as const

export const STAMP = {
  housingExempt: ${stamp.housingExempt},
  bands: [
${tsBands(stamp.bands, ["upTo", "duty"])},
  ],
} as const

export const ACQUISITION = ${JSON.stringify(acquisition, null, 2)} as const

export const CAPITAL_GAINS = ${JSON.stringify(capitalGains, null, 2)} as const

export const INHERITANCE = ${JSON.stringify(inheritance, null, 2)} as const

export const RETIREMENT = ${tsRetirement(retirement)} as const

export const HOLDING = {
  fairMarket: ${holding.fairMarket},
  oneHouseDeduction: ${holding.oneHouseDeduction},
  otherDeduction: ${holding.otherDeduction},
  cityRate: ${holding.cityRate},
  educationShare: ${holding.educationShare},
  ruralShare: ${holding.ruralShare},
  jongbuOne: ${holding.jongbuOne},
  jongbuTwo: ${holding.jongbuTwo},
  jongbuThree: ${holding.jongbuThree},
  propertyOneHouse: [
${tsSlice(holding.propertyOneHouse)},
  ],
  propertyOther: [
${tsSlice(holding.propertyOther)},
  ],
} as const

export const LICENSE = ${JSON.stringify(license, null, 2)} as const

export const CORP_EXTRA_LAND = ${corpExtra}

export const LTV_POLICY = {
  unregulated: ${ltv.unregulated},
  regulated: ${ltv.regulated},
  firstTime: ${ltv.firstTime},
  firstTimeCap: ${ltv.firstTimeCap},
  extraBanned: ${ltv.extraBanned},
} as const

export const DSR_POLICY = ${JSON.stringify(dsr, null, 2)} as const

export const RENT_CREDIT = ${JSON.stringify(rentCredit, null, 2)} as const

export const CAR_TAX = {
  private: [
${carTax.private
  .map((row) => {
    const max = row.maxCc === Number.POSITIVE_INFINITY ? "Number.POSITIVE_INFINITY" : row.maxCc
    return `    { maxCc: ${max}, perCc: ${row.perCc} }`
  })
  .join(",\n")},
  ],
  commercial: [
${carTax.commercial
  .map((row) => {
    const max = row.maxCc === Number.POSITIVE_INFINITY ? "Number.POSITIVE_INFINITY" : row.maxCc
    return `    { maxCc: ${max}, perCc: ${row.perCc} }`
  })
  .join(",\n")},
  ],
  evPrivate: ${carTax.evPrivate},
  education: ${carTax.education},
} as const

export const LABOR_STATUTE = ${JSON.stringify(laborStatute, null, 2)} as const

export const PAYROLL_INSURANCE = ${JSON.stringify(payrollInsurance, null, 2)} as const

export const VEHICLE_ACQUISITION = ${JSON.stringify(vehicleAcquisition, null, 2)} as const

export const OVERTIME_STATUTE = ${JSON.stringify(overtimeStatute, null, 2)} as const

export const INTEREST_TAX = ${JSON.stringify(interestTax, null, 2)} as const

export const PAYROLL_DEDUCTIONS = ${JSON.stringify(payrollDeductions, null, 2)} as const

export const PARENTAL_LEAVE = ${tsParental(parentalLeave)} as const

export const MIN_WAGE = ${JSON.stringify(minWage, null, 2)} as const

export const MATERNITY_LEAVE = ${JSON.stringify(maternityLeave, null, 2)} as const

export const IMPORT_CLEARANCE = ${JSON.stringify(importClearance, null, 2)} as const
`
  writeFileSync(join(root, "lib/policy.generated.ts"), ts)
  console.log(`정책 갱신 ${fetchedAt}`)
  console.log("소득세", income.map((r) => `${r.rate * 100}%/${r.deduction}`).join(" · "))
  console.log("상증세", gift.map((r) => `${r.rate * 100}%/${r.deduction}`).join(" · "))
  console.log("법인세", corp.map((r) => `${r.rate * 100}%/${r.deduction}`).join(" · "))
  console.log("부가세", vatRate, "중개 매매", brokerage.sale.map((r) => r.rate).join("/"))
  console.log("LTV", ltv.unregulated, ltv.regulated, "DSR", dsr.bank)
  console.log(
    "증여공제",
    `배우자 ${giftDeductions.spouse} · 존속 ${giftDeductions.ascendant} · 비속 ${giftDeductions.descendant} · 기타 ${giftDeductions.other}`,
  )
  console.log(
    "4대보험",
    `연금 ${payrollInsurance.pensionEmployeeRate} ${payrollInsurance.pensionCeil} · 건보 ${payrollInsurance.healthEmployeeRate} 상한 ${payrollInsurance.healthEmployeeCap}`,
  )
  console.log("월세공제", rentCredit.rate, rentCredit.rateLow, "자동차세", carTax.private.map((r) => r.perCc).join("/"))
  console.log("근로", laborStatute.weeklyFullHours, "시간 · 연차", laborStatute.annualLeaveBase, laborStatute.annualLeaveCap, "퇴직", laborStatute.severanceDays)
  console.log("퇴직소득공제", retirement.years.map((row) => row.perYear).join("/"))
  console.log(
    "자동차취득",
    vehicleAcquisition.passenger,
    vehicleAcquisition.compact,
    "교육",
    vehicleAcquisition.educationOffset,
    vehicleAcquisition.educationShare,
    "경형",
    vehicleAcquisition.compactRelief,
    vehicleAcquisition.compactUntil,
  )
  console.log(
    "연장",
    overtimeStatute.overtimePremium,
    overtimeStatute.holidayPremium,
    overtimeStatute.holidayOverPremium,
    overtimeStatute.nightPremium,
    overtimeStatute.holidaySplitHours,
  )
  console.log("이자", interestTax.national, interestTax.localShare, interestTax.withholding)
  console.log(
    "급여공제",
    "식사",
    payrollDeductions.mealExemptMonthly,
    "청년",
    payrollDeductions.youthReliefRate,
    payrollDeductions.youthReliefCap,
    "기본",
    payrollDeductions.basicPersonDeduction,
    "근로공제",
    payrollDeductions.earnedDeductionCap,
  )
  console.log("육아", parentalLeave.floor, parentalLeave.general.map((r) => r.cap).join("/"), "맞돌봄", parentalLeave.bothCapsFirst6.join("/"))
  console.log("최저임금", minWage.year, minWage.hourly, minWage.monthly, minWage.monthlyHours)
  console.log("출산", maternityLeave.days.standard, maternityLeave.cap.standard, maternityLeave.eiExtraCapDays.standard)
  console.log("직구", importClearance.listUsd, importClearance.listUsUsd, importClearance.deMinimisUsd)
  return json
}

function isDirectRun() {
  const entry = process.argv[1]
  if (!entry) return false
  return fileURLToPath(import.meta.url) === entry
}

if (isDirectRun()) {
  refreshPolicy().catch((error) => {
    console.error(error)
    const hasPrev = existsSync(join(root, "lib/policy.generated.ts"))
    const code = exitCodeForRefreshFailure(error, {
      strict: process.env.POLICY_STRICT === "1",
      hasPrev,
    })
    if (hasPrev && isTransientFetchError(error)) {
      console.error("법제처 Open API가 잠깐 실패했습니다. 이전 세율을 유지하고 성공으로 끝냅니다.")
    } else if (hasPrev) {
      console.error("이전 세율 파일을 그대로 씁니다.")
    }
    // 사이트 빌드(prebuild)와 일시 HTTP 실패는 이전 세율이 있으면 0.
    // 파서·필수 필드 실패는 POLICY_STRICT=1 에서 1로 남겨 메일이 가게 합니다.
    process.exit(code)
  })
}
