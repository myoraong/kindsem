import assert from "node:assert/strict"
import test from "node:test"
import {
  closeNavMenu,
  coarseNavClickOpensMenu,
  getOpenNavMenu,
  openNavMenu,
  subscribeNavMenu,
} from "./nav-menu-open.ts"

test("헤더 메뉴는 한 번에 하나만 열린다", () => {
  closeNavMenu()
  const seen: (string | null)[] = []
  const stop = subscribeNavMenu(() => seen.push(getOpenNavMenu()))
  openNavMenu("work")
  openNavMenu("realty")
  assert.equal(getOpenNavMenu(), "realty")
  closeNavMenu("work")
  assert.equal(getOpenNavMenu(), "realty")
  closeNavMenu("realty")
  assert.equal(getOpenNavMenu(), null)
  assert.deepEqual(seen, ["work", "realty", null])
  stop()
})

test("터치 첫 탭은 메뉴를 열고, 열린 뒤의 탭은 이동합니다", () => {
  assert.equal(coarseNavClickOpensMenu(true, false), true)
  assert.equal(coarseNavClickOpensMenu(true, true), false)
  assert.equal(coarseNavClickOpensMenu(false, false), false)
})
