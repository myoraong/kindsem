
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { CALCULATORS } from "./catalog.ts"
import { CALC_GUIDES } from "./calc-guides.ts"
import { calcSeo } from "./seo.ts"

const FORBIDDEN = /친절한|웰컴|최고|차별화|lorem|ipsum|Welcome/i

function withGuide() {
  return CALCULATORS.filter((item) => item.slug !== "quick")
}

test("사다리타기는 제목·본문에 계산기라는 말을 쓰지 않는다", () => {
  const guide = CALC_GUIDES.ladder
  assert.ok(guide)
  assert.doesNotMatch(guide.title, /계산기/)
  assert.doesNotMatch(guide.paragraphs.join(""), /계산기/)
  assert.doesNotMatch(calcSeo("ladder").query, /계산기/)
})

test("사칙연산에는 안내 글을 붙이지 않는다", () => {
  assert.equal(CALC_GUIDES.quick, undefined)
  const src = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../components/calc/quick-calc.tsx"),
    "utf8",
  )
  assert.doesNotMatch(src, /식 아래 결과가 남는 사칙/)
  assert.match(src, /기록은 이 기기에만 있고 서버로 보내지 않습니다/)
})

test("안내는 검색어 나열이 아니라 문장이다", () => {
  for (const item of withGuide()) {
    const guide = CALC_GUIDES[item.slug]
    assert.ok(guide)
    for (const paragraph of guide.paragraphs) {
      assert.match(paragraph, /(다|요|까)\.$/, `${item.slug} 문장 아님`)
      assert.doesNotMatch(paragraph, / · /, `${item.slug} 검색어 나열`)
    }
  }
})

test("본문 첫 문장은 한 줄 설명을 되풀이하지 않는다", () => {
  for (const item of withGuide()) {
    const guide = CALC_GUIDES[item.slug]
    assert.ok(guide)
    const needle = item.blurb.replace(/입니다\.$/, "").slice(0, 10)
    assert.ok(
      !guide.paragraphs[0].includes(needle),
      `${item.slug} 본문이 한 줄과 겹침: ${needle}`,
    )
  }
})

test("법령 계산기에 고유 안내 제목과 본문이 있다", () => {
  const titles = new Set<string>()
  const openings = new Set<string>()
  for (const item of withGuide()) {
    const guide = CALC_GUIDES[item.slug]
    assert.ok(guide, `${item.slug} 안내 없음`)
    assert.ok(guide.title.length >= 8, `${item.slug} 제목 짧음`)
    assert.ok(guide.paragraphs.length >= 3, `${item.slug} 문단 부족`)
    const body = guide.paragraphs.join("")
    assert.ok(body.length >= 150, `${item.slug} 본문 짧음`)
    assert.doesNotMatch(guide.title, FORBIDDEN)
    assert.doesNotMatch(body, FORBIDDEN)
    assert.equal(titles.has(guide.title), false, `제목 중복 ${guide.title}`)
    titles.add(guide.title)
    assert.equal(openings.has(guide.paragraphs[0]), false, `첫 문단 중복 ${item.slug}`)
    openings.add(guide.paragraphs[0])
  }
})
