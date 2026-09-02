import assert from "node:assert/strict"
import test from "node:test"
import { CALCULATORS } from "./catalog.ts"
import {
  CALC_SEO,
  calcDescription,
  calcJsonLd,
  calcMetadata,
  calcPath,
  calcSearchText,
  calcSeo,
  homeJsonLd,
} from "./seo.ts"

test("계산기마다 검색어가 있고 제목에 계산기가 들어간다", () => {
  for (const item of CALCULATORS) {
    const seo = CALC_SEO[item.slug]
    assert.ok(seo, item.slug)
    assert.match(seo.query, /계산기/)
    assert.ok(seo.also.length >= 2, item.slug)
    assert.match(calcPath(item.slug), new RegExp(`/calc/${item.slug}/$`))
  }
  assert.equal(Object.keys(CALC_SEO).length, CALCULATORS.length)
})

test("실수령·퇴직금·복비는 사람들이 넣는 말로 제목을 단다", () => {
  assert.equal(calcSeo("take-home").query, "실수령액 계산기")
  assert.equal(calcSeo("severance").query, "퇴직금 계산기")
  assert.equal(calcSeo("weekly-holiday").query, "주휴수당 계산기")
  assert.equal(calcSeo("brokerage").query, "중개수수료 계산기")
  assert.ok(calcSeo("brokerage").also.includes("복비 계산기"))
  assert.equal(calcSeo("acquisition").query, "취득세 계산기")
  assert.equal(calcSeo("ladder").query, "사다리타기 계산기")
  assert.ok(calcSeo("ladder").also.includes("사다리게임"))
  assert.ok(calcSeo("ladder").also.includes("제비뽑기"))
})

test("페이지 메타에 홈 canonical을 쓰지 않는다", () => {
  const item = CALCULATORS.find((row) => row.slug === "take-home")
  assert.ok(item)
  const meta = calcMetadata(item)
  assert.equal(meta.title, "실수령액 계산기")
  assert.equal(meta.alternates?.canonical, "/calc/take-home/")
  assert.notEqual(meta.alternates?.canonical, "/")
  assert.match(String(meta.description), /실수령액 계산기/)
  assert.ok(Array.isArray(meta.keywords) && meta.keywords.includes("실수령액 계산기"))
  assert.doesNotMatch(String(meta.description), /전에에/)
})

test("검색 텍스트에 별칭이 들어간다", () => {
  assert.match(calcSearchText("take-home"), /넷페이/)
  assert.match(calcSearchText("brokerage"), /복비/)
  assert.match(calcDescription(CALCULATORS.find((row) => row.slug === "severance")!), /퇴직금 계산기/)
})

test("JSON-LD에 계산기 URL이 있다", () => {
  const item = CALCULATORS.find((row) => row.slug === "car-tax")
  assert.ok(item)
  const [app, crumbs] = calcJsonLd(item)
  assert.equal(app["@type"], "WebApplication")
  assert.equal(app.name, "자동차세 계산기")
  assert.equal(app.url, "https://kindsem.com/calc/car-tax/")
  assert.equal(crumbs["@type"], "BreadcrumbList")
  assert.deepEqual(
    (app.publisher as { alternateName: string[] }).alternateName,
    ["Kindsem", "카인드셈"],
  )
})

test("홈 JSON-LD에 카인드셈 별칭이 있다", () => {
  const [site] = homeJsonLd()
  assert.equal(site["@type"], "WebSite")
  assert.deepEqual(site.alternateName, ["Kindsem", "카인드셈"])
})
