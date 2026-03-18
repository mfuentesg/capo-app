import { useMemo, useState } from "react"
import { getAllChords, searchChords, type ChordEntry } from "../utils/chord-db-helpers"

export function useChordSearch() {
  const [query, setQuery] = useState("")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const chords = useMemo((): ChordEntry[] => {
    let results = query ? searchChords(query) : getAllChords()
    if (selectedKey) results = results.filter((c) => c.key === selectedKey)
    return results
  }, [query, selectedKey])

  function toggleKey(key: string) {
    setSelectedKey((prev) => (prev === key ? null : key))
  }

  return { chords, query, setQuery, selectedKey, toggleKey }
}
