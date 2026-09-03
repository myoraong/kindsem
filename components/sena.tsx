import Image from "next/image"
import { MASCOT } from "@/lib/brand"
import { cn } from "@/lib/utils"

export function Sena({
  variant = "full",
  className,
  priority = false,
}: {
  variant?: "full" | "face" | "icon"
  className?: string
  priority?: boolean
}) {
  if (variant === "icon") {
    return (
      <Image
        src="/kindsem-sena-icon.png"
        alt={MASCOT.name}
        width={512}
        height={512}
        className={cn("size-9 object-contain", className)}
        priority={priority}
      />
    )
  }

  if (variant === "face") {
    return (
      <Image
        src="/kindsem-sena-face.png"
        alt={MASCOT.name}
        width={384}
        height={384}
        className={cn("size-11 object-contain", className)}
        priority={priority}
      />
    )
  }

  return (
    <Image
      src="/kindsem-sena.png"
      alt={MASCOT.alt}
      width={640}
      height={960}
      className={cn("h-auto w-full", className)}
      priority={priority}
    />
  )
}
