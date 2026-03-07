"use server"

import { createClient } from "@/lib/supabase/server"

export async function signOutAction() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}
