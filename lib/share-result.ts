import { shareCopyText } from "./format.ts"

/** 공유 창을 닫았으면 복사로 넘어가지 않습니다. */
export function shareWasCancelled(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "AbortError"
  )
}

export function canUseWebShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function"
}

/** 결과와 주소를 공유합니다. 공유가 없으면 복사로 바꿉니다. */
export async function shareResultText(line: string): Promise<"shared" | "cancelled" | "copied"> {
  const text = shareCopyText(line)
  if (canUseWebShare()) {
    try {
      await navigator.share({ text })
      return "shared"
    } catch (error) {
      if (shareWasCancelled(error)) return "cancelled"
    }
  }
  await navigator.clipboard.writeText(text)
  return "copied"
}
