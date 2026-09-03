#!/usr/bin/env node
/**
 * 네이버 서치어드바이저·Bing·Yandex에 공개 URL을 알립니다. 구글은 IndexNow를 쓰지 않습니다.
 */
import { INDEXNOW_KEY, publicUrls } from "../lib/site-urls.ts"

const host = "kindsem.com"
const keyLocation = `https://${host}/${INDEXNOW_KEY}.txt`
const urlList = publicUrls()
const body = JSON.stringify({
  host,
  key: INDEXNOW_KEY,
  keyLocation,
  urlList,
})

const endpoints = [
  ["naver", "https://searchadvisor.naver.com/indexnow"],
  ["indexnow.org", "https://api.indexnow.org/indexnow"],
]

let failed = 0
for (const [name, url] of endpoints) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body,
    })
    const text = await res.text()
    if (res.ok) {
      console.log(`IndexNow ${name} ${res.status}, URL ${urlList.length}개`)
    } else {
      failed += 1
      console.warn(`IndexNow ${name} ${res.status} ${text}`)
    }
  } catch (error) {
    failed += 1
    console.warn(`IndexNow ${name} 요청 실패`, error)
  }
}

if (failed === endpoints.length) process.exit(0)
