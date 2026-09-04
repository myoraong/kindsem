import { POLICY_FETCHED_AT } from "@/lib/policy.generated"

export function PolicyStamp() {
  return (
    <p className="mt-8 text-xs leading-5 text-muted-foreground">
      세율·중개보수·인지세·부가세·LTV·DSR·4대보험·자동차세·월세공제는 {POLICY_FETCHED_AT} 법령
      현행본 기준입니다.
    </p>
  )
}
