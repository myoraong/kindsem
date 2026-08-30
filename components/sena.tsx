import Image from "next/image"
import { MASCOT } from "@/lib/brand"
import { cn } from "@/lib/utils"

export function Sena({
  variant = "full",
  className,
  priority = false,
}: {
  variant?: "full" | "face"
  className?: string
  priority?: boolean
}) {
  if (variant === "face") {
    return (
      <Image
        src="/kindsem-sena-face.png"
        alt={MASCOT.name}
        width={320}
        height={320}
        className={cn("size-11 object-contain", className)}
        priority={priority}
      />
    )
  }

  return (
    <Image
      src="/kindsem-sena.png"
      alt={MASCOT.alt}
      width={614}
      height={720}
      className={cn("h-auto w-full", className)}
      priority={priority}
    />
  )
}
