import Image from "next/image"
import { MASCOT } from "@/lib/brand"
import { cn } from "@/lib/utils"

const VARIANTS = {
  full: {
    src: "/kindsem-sena.png",
    alt: MASCOT.alt,
    width: 455,
    height: 659,
    className: "h-auto w-full bg-transparent",
  },
  calc: {
    src: "/kindsem-sena-calc.png",
    alt: MASCOT.altCalc,
    width: 624,
    height: 960,
    className: "h-auto w-full bg-transparent",
  },
  face: {
    src: "/kindsem-sena-face.png",
    alt: MASCOT.name,
    width: 512,
    height: 512,
    className: "size-11 overflow-hidden rounded-full object-cover",
  },
  icon: {
    src: "/kindsem-sena-icon.png",
    alt: MASCOT.name,
    width: 512,
    height: 512,
    className: "size-9 bg-transparent object-contain",
  },
} as const

export type SenaVariant = keyof typeof VARIANTS

export function Sena({
  variant = "full",
  className,
  priority = false,
}: {
  variant?: SenaVariant
  className?: string
  priority?: boolean
}) {
  const asset = VARIANTS[variant]
  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      className={cn(asset.className, className)}
      priority={priority}
    />
  )
}

export function SenaFigure({
  variant = "full",
  priority = false,
}: {
  variant?: "full" | "calc"
  priority?: boolean
}) {
  return (
    <figure className="w-[5.25rem] shrink-0 bg-transparent sm:w-24 md:w-28 lg:w-[7.25rem]">
      <Sena
        variant={variant}
        className={variant === "calc" ? "sena-calc" : "sena-bob"}
        priority={priority}
      />
      <figcaption className="mt-1.5 text-center">
        <span className="block text-[11px] font-semibold tracking-tight text-foreground">
          {MASCOT.name}
        </span>
        <span className="mt-0.5 hidden text-[10px] leading-4 text-muted-foreground sm:block">
          {MASCOT.meaning}
        </span>
      </figcaption>
    </figure>
  )
}
