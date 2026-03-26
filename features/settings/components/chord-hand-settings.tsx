"use client"

import { useEffect, useRef } from "react"
import { Loader2, Guitar } from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/features/settings"
import { useChordHand } from "@/features/settings/contexts/chord-hand-context"
import { cn } from "@/lib/utils"
import type { ChordHand } from "@/lib/actions/chord-hand"

const OPTIONS: { value: ChordHand; labelKey: "rightHand" | "leftHand"; mirror: boolean }[] = [
  { value: "right", labelKey: "rightHand", mirror: false },
  { value: "left", labelKey: "leftHand", mirror: true }
]

export function ChordHandSettings() {
  const { t } = useLocale()
  const { chordHand, isPending, setChordHand } = useChordHand()
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending) {
      toast.success(t.common.saved)
    }
    wasPending.current = isPending
  }, [isPending, t.common.saved])

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-bold tracking-tight">{t.settings.chordHand}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{t.settings.chordHandDescription}</p>
      </div>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t.settings.chordHand}>
        {OPTIONS.map(({ value, labelKey, mirror }) => {
          const isActive = chordHand === value
          const showSpinner = isActive && isPending
          return (
            <label
              key={value}
              className={cn(
                "relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-medium transition select-none",
                "active:scale-[0.97]",
                isActive
                  ? "border-primary/60 bg-primary/8 text-primary shadow-sm"
                  : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <input
                type="radio"
                name="chordHand"
                value={value}
                checked={isActive}
                onChange={() => setChordHand(value)}
                className="sr-only"
              />
              {showSpinner ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
              ) : (
                <Guitar className={cn("h-5 w-5 shrink-0", mirror && "-scale-x-100", isActive ? "text-primary" : "text-muted-foreground")} />
              )}
              <span className="text-xs leading-none">{t.settings[labelKey]}</span>
              {isActive && (
                <span className="absolute bottom-1.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </label>
          )
        })}
      </div>
    </section>
  )
}
