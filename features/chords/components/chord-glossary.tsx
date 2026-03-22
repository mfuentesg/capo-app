"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useChordSearch } from "../hooks/use-chord-search"
import { ChordGrid } from "./chord-grid"
import { getAvailableKeys, keyLabel } from "../utils/chord-db-helpers"
import { useLocale } from "@/features/settings"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const AVAILABLE_KEYS = getAvailableKeys()

export function ChordGlossary() {
  const { chords, query, setQuery, selectedKey, toggleKey } = useChordSearch()
  const { t } = useLocale()

  return (
    <div className="space-y-4">
      {/* Search + key filter + orientation */}
      <div className="space-y-3">
        <div className="relative flex-1 max-w-xs">
          <Input
            placeholder={t.chords.glossary.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={t.common.clearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible">
          {AVAILABLE_KEYS.map((key) => (
            <Button
              key={key}
              variant={selectedKey === key ? "default" : "outline"}
              size="sm"
              className={cn("h-9 min-w-[2.75rem] shrink-0 px-3 text-sm font-semibold", selectedKey === key && "shadow-none")}
              onClick={() => toggleKey(key)}
            >
              {keyLabel(key)}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count — hidden when empty (empty state shows instead) */}
      {chords.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t.chords.glossary.chordsFound.replace("{count}", String(chords.length))}
        </p>
      )}

      <ChordGrid chords={chords} />
    </div>
  )
}
