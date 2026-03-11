"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function deleteAccountAction(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase.rpc("delete_user_account", { p_user_id: user.id })
  if (error) throw error

  await supabase.auth.signOut()
  redirect("/login")
}
