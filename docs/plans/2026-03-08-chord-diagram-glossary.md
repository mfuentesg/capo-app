# Chord Diagram Glossary — Implementation Plan

**Date:** 2026-03-08
**GitHub Issue:** #45
**Status:** Pending

## Problem

The app renders chord diagrams inline within the lyrics view (via `@tombatossals/react-chords`), but there's no way to browse all available chords. Musicians learning a song want to look up unfamiliar chords, see alternative fingerings, and explore scales.

## Approach

Add a `/dashboard/chords` route with a searchable chord glossary. Users can:
- Search/filter by chord name, key, or type (major, minor, 7th, etc.)
- See all available fingerings for a chord (multiple positions)
- Click any chord in the lyrics view to jump to its glossary entry (stretch goal)

Data comes from `@tombatossals/chords-db` which is already installed.

---

### Task 1: Create the chords feature

```
features/chords/
├── components/
│   ├── chord-glossary.tsx        # Main glossary view
│   ├── chord-detail.tsx          # All fingerings for a chord
│   └── chord-grid.tsx            # Grid of chord cards
├── hooks/
│   └── use-chord-search.ts       # Filter/search logic
├── utils/
│   └── chord-db-helpers.ts       # Helpers to query chords-db
└── index.ts
```

---

### Task 2: Chord DB helpers

**Files:**
- Create: `features/chords/utils/chord-db-helpers.ts`

```typescript
import guitarChords from "@tombatossals/chords-db/lib/guitar.json"

export interface ChordEntry {
  key: string
  suffix: string
  name: string       // e.g. "Am" = key "A" + suffix "m"
  positions: ChordPosition[]
}

export interface ChordPosition {
  frets: number[]
  fingers: number[]
  baseFret: number
  barres: number[]
  capo?: boolean
}

/** Returns all chords in the DB as a flat list */
export function getAllChords(): ChordEntry[] {
  return Object.entries(guitarChords.chords).flatMap(([key, suffixes]) =>
    (suffixes as Array<{ suffix: string; positions: ChordPosition[] }>).map((entry) => ({
      key,
      suffix: entry.suffix,
      name: entry.suffix === "major" ? key : `${key}${entry.suffix}`,
      positions: entry.positions
    }))
  )
}

/** Filter chords by search query (name match) */
export function searchChords(query: string): ChordEntry[] {
  const q = query.toLowerCase()
  return getAllChords().filter(
    (c) => c.name.toLowerCase().includes(q) || c.key.toLowerCase() === q
  )
}

/** Get all available keys */
export function getAvailableKeys(): string[] {
  return Object.keys(guitarChords.chords)
}
```

---

### Task 3: `useChordSearch` hook

**Files:**
- Create: `features/chords/hooks/use-chord-search.ts`

```typescript
import { useMemo, useState } from "react"
import { getAllChords, searchChords, ChordEntry } from "../utils/chord-db-helpers"

export function useChordSearch() {
  const [query, setQuery] = useState("")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const chords = useMemo((): ChordEntry[] => {
    let results = query ? searchChords(query) : getAllChords()
    if (selectedKey) results = results.filter((c) => c.key === selectedKey)
    return results
  }, [query, selectedKey])

  return { chords, query, setQuery, selectedKey, setSelectedKey }
}
```

---

### Task 4: `ChordGlossary` component

**Files:**
- Create: `features/chords/components/chord-glossary.tsx`

```tsx
"use client"

import { Input } from "@/components/ui/input"
import { useChordSearch } from "../hooks/use-chord-search"
import { ChordGrid } from "./chord-grid"
import { getAvailableKeys } from "../utils/chord-db-helpers"

export function ChordGlossary() {
  const { chords, query, setQuery, selectedKey, setSelectedKey } = useChordSearch()
  const keys = getAvailableKeys()

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search chords…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-1">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedKey(selectedKey === key ? null : key)}
              className={`px-2 py-1 text-sm rounded border ${
                selectedKey === key ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
      <ChordGrid chords={chords} />
    </div>
  )
}
```

---

### Task 5: `ChordGrid` and chord card

**Files:**
- Create: `features/chords/components/chord-grid.tsx`

Renders a responsive grid of chord cards. Each card shows:
- Chord name (`Am`, `Gmaj7`, etc.)
- The first chord diagram using the existing `ChordDiagram` component from `lyrics-editor`
- Click to open a detail panel showing all alternative fingerings

---

### Task 6: Create the route

**Files:**
- Create: `app/dashboard/chords/page.tsx`

```tsx
import { ChordGlossary } from "@/features/chords"

export const metadata = { title: "Chord Glossary" }

export default function ChordsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Chord Glossary</h1>
      <ChordGlossary />
    </div>
  )
}
```

Add "Chords" to the dashboard sidebar navigation.

---

### Task 7: Scale reference (stretch goal, v2)

Use music theory to generate scale patterns for each key (major, natural minor, pentatonic). Display as a fretboard diagram. Defer to a separate plan.

---

### Task 8: Tests

- Unit test `searchChords("Am")`: returns entries for A minor
- Unit test `getAvailableKeys()`: returns expected list
- Unit test `useChordSearch`: filter by key and query

---

### Verification

```bash
pnpm lint && pnpm typecheck && pnpm test
```
