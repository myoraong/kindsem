import assert from "node:assert/strict"
import test from "node:test"
import {
  DEFAULT_ENDS,
  DEFAULT_STARTS,
  followColumn,
  isPermutation,
  ladderMap,
  LADDER_MAX,
  LADDER_MIN,
  makeRungs,
  rungsNeighborOk,
  seededRandom,
} from "./ladder.ts"

test("출발마다 도착이 하나씩이고 겹치지 않는다", () => {
  const rungs = makeRungs(5, seededRandom(42))
  const map = ladderMap(rungs)
  assert.deepEqual([...map].sort((a, b) => a - b), [0, 1, 2, 3, 4])
  assert.equal(isPermutation(map), true)
})

test("같은 줄에서 이웃 가로줄은 붙지 않는다", () => {
  const rungs = makeRungs(8, seededRandom(7))
  assert.equal(rungsNeighborOk(rungs), true)
})

test("한 가로줄을 타면 옆 칸으로 간다", () => {
  const row = [[true, false]]
  assert.equal(followColumn(0, row), 1)
  assert.equal(followColumn(1, row), 0)
  assert.equal(followColumn(2, row), 2)
})

test("가로줄이 없으면 같은 칸으로 내려간다", () => {
  const empty = Array.from({ length: 11 }, () => [false, false, false])
  assert.deepEqual(ladderMap(empty), [0, 1, 2, 3])
})

test("인원은 2–8명으로 맞춘다", () => {
  const low = makeRungs(1, () => 0.9)
  assert.equal(low[0]?.length, LADDER_MIN - 1)
  const high = makeRungs(20, () => 0.9)
  assert.equal(high[0]?.length, LADDER_MAX - 1)
})

test("기본 이름표는 8칸이다", () => {
  assert.equal(DEFAULT_STARTS.length, 8)
  assert.equal(DEFAULT_ENDS.length, 8)
})
