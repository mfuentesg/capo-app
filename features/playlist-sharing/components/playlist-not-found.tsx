"use client"

import Link from "next/link"
import { Music2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"

const NOTES = [
  { ch: "♬", style: { top: "6%", left: "4%", fontSize: "3.5rem" }, opacity: 0.06 },
  { ch: "♪", style: { top: "12%", left: "22%", fontSize: "1.75rem" }, opacity: 0.08 },
  { ch: "♫", style: { top: "4%", right: "14%", fontSize: "2.75rem" }, opacity: 0.07 },
  { ch: "♩", style: { top: "18%", right: "5%", fontSize: "4rem" }, opacity: 0.05 },
  { ch: "♪", style: { top: "35%", left: "2%", fontSize: "2.25rem" }, opacity: 0.09 },
  { ch: "♬", style: { top: "42%", right: "3%", fontSize: "3rem" }, opacity: 0.06 },
  { ch: "♩", style: { top: "60%", left: "10%", fontSize: "2rem" }, opacity: 0.08 },
  { ch: "♫", style: { top: "65%", right: "9%", fontSize: "2.5rem" }, opacity: 0.07 },
  { ch: "♪", style: { top: "75%", left: "28%", fontSize: "3.5rem" }, opacity: 0.05 },
  { ch: "♬", style: { top: "82%", right: "22%", fontSize: "2rem" }, opacity: 0.08 },
  { ch: "♩", style: { bottom: "6%", left: "6%", fontSize: "2.75rem" }, opacity: 0.06 },
  { ch: "♫", style: { bottom: "8%", right: "5%", fontSize: "3.25rem" }, opacity: 0.07 }
]

export function PlaylistNotFound() {
  const { t } = useTranslation()

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* Decorative music notes scattered in background */}
      {NOTES.map((item, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{ position: "absolute", ...item.style, opacity: item.opacity, lineHeight: 1 }}
          className="pointer-events-none select-none text-primary"
        >
          {item.ch}
        </span>
      ))}

      {/* Centered content */}
      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-20 text-center">
        {/* Icon */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <div className="h-28 w-28 rounded-full bg-primary/8 ring-1 ring-primary/12 flex items-center justify-center">
              <Music2 className="h-14 w-14 text-primary/60" strokeWidth={1.25} />
            </div>
            <span
              aria-hidden="true"
              className="absolute -top-3 -right-2 text-2xl text-primary opacity-50 select-none"
            >
              ♪
            </span>
          </div>
        </div>

        {/* Text */}
        <div className="mb-8 max-w-sm space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.playlistShare.notFoundTitle}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.playlistShare.notFoundDescription}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {t.playlistShare.notFoundSubtext}
          </p>
        </div>

        {/* Action */}
        <Button asChild size="sm" className="rounded-full px-6">
          <Link href="/">{t.common.backToHome}</Link>
        </Button>
      </div>
    </div>
  )
}
