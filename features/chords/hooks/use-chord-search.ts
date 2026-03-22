import { useMemo, useState } from "react"
import { getAllChords, searchChords, getChordsByKey, type ChordEntry } from "../utils/chord-db-helpers"

export function useChordSearch() {
  const [query, setQuery] = useState("")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const chords = useMemo((): ChordEntry[] => {
    if (selectedKey) {
      const keyChords = getChordsByKey(selectedKey)
      if (!query) return keyChords
      const q = query.trim().toLowerCase()
      return keyChords.filter(
        (c) => c.name.toLowerCase().includes(q) || c.suffix.toLowerCase().includes(q)
      )
    }
    return query ? searchChords(query) : getAllChords()
  }, [query, selectedKey])

  function toggleKey(key: string) {
    setSelectedKey((prev) => (prev === key ? null : key))
  }

  return { chords, query, setQuery, selectedKey, toggleKey }
}
