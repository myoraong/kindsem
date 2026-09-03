import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"
import { MASCOT } from "./brand.ts"

test("세나 이름과 뜻이 카인드셈 얼굴이다", () => {
  assert.equal(MASCOT.name, "세나")
  assert.equal(MASCOT.meaning, "내가 세어 줄게요")
  assert.match(MASCOT.alt, /계산기/)
})

test("세나 그림 파일이 공개 폴더에 있다", () => {
  const root = join(process.cwd(), "public")
  assert.equal(existsSync(join(root, "kindsem-sena.png")), true)
  assert.equal(existsSync(join(root, "kindsem-sena-face.png")), true)
  assert.equal(existsSync(join(root, "kindsem-sena-icon.png")), true)
  assert.equal(existsSync(join(root, "favicon.ico")), true)
})
