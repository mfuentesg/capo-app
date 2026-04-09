"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getUserChordsAction } from "../api/actions"
import type { ChordPosition } from "../utils/chord-db-helpers"

const USER_CHORDS_QUERY_KEY = ["user-chord-definitions"] as const

export { USER_CHORDS_QUERY_KEY }

export function useUserChords(): Map<string, ChordPosition> {
  const { data } = useQuery({
    queryKey: USER_CHORDS_QUERY_KEY,
    queryFn: getUserChordsAction,
    staleTime: 5 * 60_000
  })

  return useMemo(() => {
    if (!data || data.length === 0) return new Map()
    return new Map(
      data.map((def) => [
        def.chord_name,
        {
          baseFret: def.base_fret,
          frets: def.frets,
          fingers: def.fingers,
          barres: def.barres
        } satisfies ChordPosition
      ])
    )
  }, [data])
}
