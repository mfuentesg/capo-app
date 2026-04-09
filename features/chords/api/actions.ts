"use server"

import { createClient } from "@/lib/supabase/server"
import type { ChordPosition } from "../utils/chord-db-helpers"

export interface UserChordDefinition {
  chord_name: string
  base_fret: number
  frets: number[]
  fingers: number[]
  barres: number[]
}

export async function getUserChordsAction(): Promise<UserChordDefinition[]> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("user_chord_definitions")
    .select("chord_name, base_fret, frets, fingers, barres")
    .eq("user_id", user.id)
    .order("chord_name")

  if (error) {
    console.error("Failed to fetch user chord definitions:", error)
    return []
  }

  return data ?? []
}

export async function saveUserChordAction(
  chordName: string,
  position: Pick<ChordPosition, "baseFret" | "frets" | "fingers" | "barres">
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase.from("user_chord_definitions").upsert(
    {
      user_id: user.id,
      chord_name: chordName,
      base_fret: position.baseFret,
      frets: position.frets,
      fingers: position.fingers,
      barres: position.barres,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,chord_name" }
  )

  if (error) {
    console.error("Failed to save user chord definition:", error)
  }
}

export async function deleteUserChordAction(chordName: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from("user_chord_definitions")
    .delete()
    .eq("user_id", user.id)
    .eq("chord_name", chordName)

  if (error) {
    console.error("Failed to delete user chord definition:", error)
  }
}
