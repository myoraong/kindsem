import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"
import { MASCOT } from "./brand.ts"

function pngSize(path: string) {
  const buf = readFileSync(path)
  assert.equal(buf.toString("ascii", 1, 4), "PNG")
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

function icoSizes(path: string) {
  const buf = readFileSync(path)
  const count = buf.readUInt16LE(4)
  const sizes: string[] = []
  for (let i = 0; i < count; i += 1) {
    const offset = 6 + i * 16
    const width = buf[offset] === 0 ? 256 : buf[offset]
    const height = buf[offset + 1] === 0 ? 256 : buf[offset + 1]
    sizes.push(`${width}x${height}`)
  }
  return sizes
}

test("세나 이름과 뜻이 카인드셈 얼굴이다", () => {
  assert.equal(MASCOT.name, "세나")
  assert.equal(MASCOT.meaning, "내가 세어 줄게요")
  assert.match(MASCOT.alt, /계산기/)
  assert.match(MASCOT.altCalc, /버튼을 누르며/)
})

test("세나 그림 파일이 공개 폴더에 있다", () => {
  const root = join(process.cwd(), "public")
  assert.equal(existsSync(join(root, "kindsem-sena.png")), true)
  assert.equal(existsSync(join(root, "kindsem-sena-face.png")), true)
  assert.equal(existsSync(join(root, "kindsem-sena-icon.png")), true)
  assert.equal(existsSync(join(root, "kindsem-sena-calc.png")), true)
  assert.equal(existsSync(join(root, "favicon.ico")), true)
  assert.equal(existsSync(join(root, "icon-48.png")), true)
  assert.equal(existsSync(join(root, "icon-96.png")), true)
  assert.equal(existsSync(join(root, "icon-192.png")), true)
})

test("구글 검색용 파비콘이 48픽셀 배수다", () => {
  const root = join(process.cwd(), "public")
  assert.deepEqual(pngSize(join(root, "icon-48.png")), { width: 48, height: 48 })
  assert.deepEqual(pngSize(join(root, "icon-96.png")), { width: 96, height: 96 })
  assert.deepEqual(pngSize(join(root, "icon-192.png")), { width: 192, height: 192 })
  assert.ok(icoSizes(join(root, "favicon.ico")).includes("48x48"))
})
