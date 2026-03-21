"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export type ChordHand = "right" | "left"

const VALID_CHORD_HANDS: ChordHand[] = ["right", "left"]

export async function setChordHandAction(hand: ChordHand) {
  if (!VALID_CHORD_HANDS.includes(hand)) {
    throw new Error("Invalid chord hand")
  }

  const cookieStore = await cookies()
  cookieStore.set("NEXT_CHORD_HAND", hand, {
    path: "/",
    maxAge: 31536000,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  })

  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.rpc("merge_user_preference", {
        p_user_id: user.id,
        p_key: "chordHand",
        p_value: hand
      })
    }
  } catch {
    // cookie already set — DB write is best-effort
  }
}
