import assert from "node:assert/strict"
import test from "node:test"
import {
  clampLadderCount,
  defaultEndLabels,
  defaultStartLabels,
  followPath,
  generateRungs,
  hasAdjacentRungs,
  isPermutation,
  LADDER_MAX,
  LADDER_MIN,
  ladderMapping,
  mappingCopyLine,
  pairCopyLine,
  defaultPrizeMarks,
  resizePrizeMarks,
  winningStarts,
  resizeLabels,
  tracePath,
} from "./ladder.ts"

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

test("인원은 2~8로 맞춘다", () => {
  assert.equal(clampLadderCount(1), LADDER_MIN)
  assert.equal(clampLadderCount(9), LADDER_MAX)
  assert.equal(clampLadderCount(4.6), 5)
  assert.deepEqual(defaultStartLabels(4), ["가", "나", "다", "라"])
  assert.deepEqual(defaultEndLabels(3), ["1", "2", "3"])
  assert.deepEqual(resizeLabels(["가", "민수"], 4, (i) => defaultStartLabels(4)[i]!), [
    "가",
    "민수",
    "다",
    "라",
  ])
})

test("가로줄은 같은 줄에서 이웃과 붙지 않는다", () => {
  assert.equal(hasAdjacentRungs([[true, false, true]]), false)
  assert.equal(hasAdjacentRungs([[true, true]]), true)
  assert.equal(hasAdjacentRungs([[false, true, false], [true, false, true]]), false)

  for (let n = LADDER_MIN; n <= LADDER_MAX; n++) {
    for (let seed = 0; seed < 40; seed++) {
      const rungs = generateRungs(n, 10, mulberry32(seed * 17 + n))
      assert.equal(hasAdjacentRungs(rungs), false, `n=${n} seed=${seed}`)
      assert.equal(rungs.length, 10)
      assert.equal(rungs[0]?.length, n - 1)
    }
  }
})

test("사다리를 타면 출발마다 도착이 하나씩이다", () => {
  const oneRung = [[true, false]]
  assert.equal(followPath(0, oneRung), 1)
  assert.equal(followPath(1, oneRung), 0)
  assert.equal(followPath(2, oneRung), 2)

  const known = [
    [true, false],
    [false, true],
    [true, false],
  ]
  assert.equal(followPath(0, known), 2)
  assert.equal(followPath(1, known), 1)
  assert.equal(followPath(2, known), 0)
  assert.deepEqual(tracePath(0, known), [0, 1, 2, 2])
  assert.ok(isPermutation(ladderMapping(3, known)))

  const swap = [[true]]
  assert.deepEqual(ladderMapping(2, swap), [1, 0])

  for (let n = LADDER_MIN; n <= LADDER_MAX; n++) {
    for (let seed = 0; seed < 30; seed++) {
      const rungs = generateRungs(n, 10, mulberry32(1000 + seed * n))
      const map = ladderMapping(n, rungs)
      assert.equal(map.length, n)
      assert.ok(isPermutation(map), `n=${n} seed=${seed} map=${map.join(",")}`)
    }
  }
})

test("복사 문장은 누가 어디로만 적는다", () => {
  assert.equal(pairCopyLine("가", "2"), "가 → 2")
  assert.equal(mappingCopyLine(["가", "나"], ["1", "2"], [1, 0]), "가 → 2 · 나 → 1")
})

test("당첨 도착으로 온 출발만 고른다", () => {
  assert.deepEqual(defaultPrizeMarks(4), [true, false, false, false])
  assert.deepEqual(resizePrizeMarks([false, true, false, true], 2), [false, true])
  assert.deepEqual(resizePrizeMarks([false, false, true], 2), [true, false])
  assert.deepEqual(resizePrizeMarks([true], 4), [true, false, false, false])

  // 가→2, 나→3, 다→1, 라→4  — 도착 1·3이 당첨이면 나와 다
  assert.deepEqual(winningStarts([1, 2, 0, 3], [true, false, true, false]), [1, 2])
  assert.deepEqual(winningStarts([1, 0], [true, false]), [1])
  assert.deepEqual(winningStarts([0, 1, 2], [false, false, false]), [])
})
