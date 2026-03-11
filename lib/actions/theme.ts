"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

type Theme = "light" | "dark" | "system"

const VALID_THEMES: Theme[] = ["light", "dark", "system"]

export async function setThemeAction(theme: Theme) {
  if (!VALID_THEMES.includes(theme)) {
    throw new Error("Invalid theme")
  }

  const cookieStore = await cookies()
  cookieStore.set("NEXT_THEME", theme, {
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
      await supabase.rpc("merge_user_preference", { p_user_id: user.id, p_key: "theme", p_value: theme })
    }
  } catch {
    // cookie already set — DB write is best-effort
  }
}
