import { createClient } from "@/lib/supabase/client"
import type { UserInfo } from "@/features/auth/types"

export async function getUser(): Promise<UserInfo | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    return null
  }

  return {
    id: user?.id || "",
    email: user?.email,
    avatarUrl: (user?.user_metadata?.avatar_url as string | undefined) || undefined,
    fullName: (user?.user_metadata?.full_name as string | undefined) || undefined,
    displayName: (user?.user_metadata?.name as string | undefined) || undefined
  }
}

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
    error
  } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session
}
