import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"
import { CALCULATORS } from "./catalog.ts"
import { SITE_URL } from "./site.ts"
import { INDEXNOW_KEY, publicPaths, publicUrls } from "./site-urls.ts"

test("공개 URL은 홈·목록·계산기를 모두 포함한다", () => {
  const paths = publicPaths()
  assert.ok(paths.includes("/"))
  assert.ok(paths.includes("/calc/"))
  assert.ok(paths.includes("/realty/"))
  for (const item of CALCULATORS) {
    assert.ok(paths.includes(`/calc/${item.slug}/`), item.slug)
  }
  assert.ok(publicUrls().every((url) => url.startsWith(SITE_URL)))
})

test("IndexNow 키가 사이트 루트에 있다", () => {
  const body = readFileSync(join(process.cwd(), "public", `${INDEXNOW_KEY}.txt`), "utf8").trim()
  assert.equal(body, INDEXNOW_KEY)
})

test("llms.txt에 계산기 URL이 있다", () => {
  const body = readFileSync(join(process.cwd(), "public", "llms.txt"), "utf8")
  for (const item of CALCULATORS) {
    assert.match(body, new RegExp(`/calc/${item.slug}/`))
  }
})
