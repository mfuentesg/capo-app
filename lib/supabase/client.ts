"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"
import { env } from "@/lib/env"

const createClient = (() => {
  let client: ReturnType<typeof createBrowserClient<Database>> | null = null

  return () => {
    if (client) {
      return client
    }

    client = createBrowserClient<Database>(
      env.required.supabaseUrl,
      env.required.supabasePublishableKey
    )
    return client
  }
})()

export { createClient }
