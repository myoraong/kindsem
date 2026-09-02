#!/usr/bin/env node
/**
 * Bing·Yandex에 공개 URL을 알립니다. 구글은 IndexNow를 쓰지 않습니다.
 */
import { INDEXNOW_KEY, publicUrls } from "../lib/site-urls.ts"

const host = "kindsem.com"
const keyLocation = `https://${host}/${INDEXNOW_KEY}.txt`
const urlList = publicUrls()

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList,
  }),
})

if (!res.ok) {
  console.error(`IndexNow ${res.status} ${await res.text()}`)
  process.exit(0)
}
console.log(`IndexNow ${res.status}, URL ${urlList.length}개`)
