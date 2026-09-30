import assert from "node:assert/strict"
import test from "node:test"
import { CALCULATORS } from "./catalog.ts"
import {
  READINGS,
  readingBody,
  readingBySlug,
  readingParagraphs,
  readingPath,
  readingsForCalc,
} from "./reading.ts"
import { publicPaths } from "./site-urls.ts"

const FORBIDDEN = /친절한|웰컴|최고|차별화|lorem|ipsum|Welcome/i

const CALC_LINKS: Record<string, readonly string[]> = {
  "net-pay": ["take-home", "offer-compare"],
  "insurance-order": ["take-home"],
  "severance-and-tax": ["severance", "retirement-tax"],
  "weekly-holiday-weeks": ["weekly-holiday", "min-wage", "part-time-month"],
  "acquisition-apart": ["acquisition", "closing-cost", "vehicle-tax"],
  "brokerage-cap": ["brokerage"],
  "gains-on-spread": ["capital-gains", "corporate-gains"],
  "dsr-and-ltv": ["dsr", "ltv", "mortgage", "loan-interest"],
  "jeonse-or-rent": ["jeonse", "rent-convert", "jeonse-vs-rent", "rent-credit"],
  "car-two-taxes": ["car-tax", "vehicle-tax"],
}

test("읽어 두기 글은 제목이 고유하고 본문이 문장이다", () => {
  assert.ok(READINGS.length >= 8)
  assert.ok(READINGS.length <= 10)
  const titles = new Set<string>()
  const slugs = new Set<string>()
  const openings = new Set<string>()
  for (const item of READINGS) {
    assert.equal(titles.has(item.title), false, `제목 중복 ${item.title}`)
    titles.add(item.title)
    assert.equal(slugs.has(item.slug), false, `슬러그 중복 ${item.slug}`)
    slugs.add(item.slug)
    assert.ok(item.title.length >= 8, item.slug)
    assert.ok(item.sections.length >= 4, `${item.slug} 절 부족`)
    assert.match(item.description, /(다|요|까)\.$/, `${item.slug} 설명`)
    assert.doesNotMatch(item.title, FORBIDDEN)
    assert.doesNotMatch(item.description, FORBIDDEN)
    assert.doesNotMatch(item.description, / · /)
    const paragraphs = readingParagraphs(item)
    assert.ok(paragraphs.length >= 8, `${item.slug} 문단 부족`)
    assert.equal(openings.has(paragraphs[0]), false, `첫 문단 중복 ${item.slug}`)
    openings.add(paragraphs[0])
    for (const section of item.sections) {
      assert.ok(section.heading.length >= 2, item.slug)
      assert.ok(section.paragraphs.length >= 1, item.slug)
    }
    for (const paragraph of paragraphs) {
      assert.match(paragraph, /(다|요|까)\.$/, `${item.slug} 문장 아님`)
      assert.doesNotMatch(paragraph, / · /, `${item.slug} 검색어 나열`)
      assert.doesNotMatch(paragraph, FORBIDDEN, item.slug)
    }
    const body = readingBody(item)
    assert.ok(body.length >= 1200, `${item.slug} 본문 ${body.length}`)
    assert.ok(body.length >= 1500, `${item.slug} 본문 짧음 ${body.length}`)
    assert.equal(readingBySlug(item.slug)?.title, item.title)
    assert.equal(readingPath(item.slug), `/guide/${item.slug}/`)
  }
})

test("계산기에서 관련 글로 연결된다", () => {
  const known = new Set(CALCULATORS.map((item) => item.slug))
  for (const [slug, calcs] of Object.entries(CALC_LINKS)) {
    const article = readingBySlug(slug)
    assert.ok(article, slug)
    assert.deepEqual([...article.calcs], calcs)
    for (const calc of calcs) {
      assert.equal(known.has(calc), true, calc)
      assert.ok(
        readingsForCalc(calc).some((item) => item.slug === slug),
        `${calc} → ${slug}`,
      )
    }
  }
  assert.deepEqual(
    readingsForCalc("take-home").map((item) => item.slug),
    ["net-pay", "insurance-order"],
  )
  assert.deepEqual(
    readingsForCalc("vehicle-tax").map((item) => item.slug),
    ["acquisition-apart", "car-two-taxes"],
  )
  assert.deepEqual(readingsForCalc("quick"), [])
})

test("사이트맵 경로에 읽어 두기가 들어간다", () => {
  const paths = publicPaths()
  assert.ok(paths.includes("/guide/"))
  for (const item of READINGS) {
    assert.ok(paths.includes(readingPath(item.slug)), item.slug)
  }
})
