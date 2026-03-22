"use client"

import { Loader2, Guitar } from "lucide-react"
import { useLocale } from "@/features/settings"
import { useChordHand } from "@/features/settings/contexts/chord-hand-context"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { ChordHand } from "@/lib/actions/chord-hand"

const OPTIONS: { value: ChordHand; labelKey: "rightHand" | "leftHand"; mirror: boolean }[] = [
  { value: "right", labelKey: "rightHand", mirror: false },
  { value: "left", labelKey: "leftHand", mirror: true }
]

export function ChordHandSettings() {
  const { t } = useLocale()
  const { chordHand, isPending, setChordHand } = useChordHand()

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{t.settings.chordHand}</h2>
        <p className="text-sm text-muted-foreground">{t.settings.chordHandDescription}</p>
      </div>
      <div className="flex gap-2" role="radiogroup" aria-label={t.settings.chordHand}>
        {OPTIONS.map(({ value, labelKey, mirror }) => {
          const isActive = chordHand === value
          const showSpinner = isActive && isPending
          return (
            <Label
              key={value}
              className={cn(
                "flex cursor-pointer select-none items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
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
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <Guitar className={cn("h-4 w-4 shrink-0", mirror && "-scale-x-100")} />
              )}
              {t.settings[labelKey]}
            </Label>
          )
        })}
      </div>
    </section>
  )
}
