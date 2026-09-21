"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { shareCopyText } from "@/lib/format"
import { canUseWebShare, shareResultText } from "@/lib/share-result"

export function useCanShare() {
  const [canShare, setCanShare] = useState(false)
  useEffect(() => {
    setCanShare(canUseWebShare())
  }, [])
  return canShare
}

export async function copyResultLine(line: string) {
  await navigator.clipboard.writeText(shareCopyText(line))
  toast.success("복사됨")
}

export async function shareResultLine(line: string) {
  const outcome = await shareResultText(line)
  if (outcome === "copied") toast.success("복사됨")
}

export function ResultActions({ line }: { line: string }) {
  const canShare = useCanShare()

  return (
    <div className={canShare ? "mt-5 grid grid-cols-2 gap-2" : "mt-5"}>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={() => {
          void copyResultLine(line)
        }}
      >
        결과와 주소 복사
      </Button>
      {canShare ? (
        <Button
          type="button"
          className="h-11 w-full"
          onClick={() => {
            void shareResultLine(line)
          }}
        >
          공유
        </Button>
      ) : null}
    </div>
  )
}
