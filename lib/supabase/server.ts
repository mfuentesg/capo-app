import { createServerClient } from "@supabase/ssr"
import type { Database } from "./database.types"
import { env } from "@/lib/env"

export async function createClient() {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()

  return createServerClient<Database>(
    env.required.supabaseUrl,
    env.required.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {}
        }
      }
    }
  )
}
