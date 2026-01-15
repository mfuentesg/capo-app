"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

/**
 * Validates required environment variables for Supabase client
 */
function validateEnvVars() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please add it to your .env.local file."
    )
  }

  if (!supabasePublishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable. Please add it to your .env.local file."
    )
  }

  return { supabaseUrl, supabasePublishableKey }
}

/**
 * Creates a Supabase client for use in client components
 * Uses singleton pattern to prevent multiple instances
 */
let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (client) {
    return client
  }

  const { supabaseUrl, supabasePublishableKey } = validateEnvVars()

  client = createBrowserClient<Database>(supabaseUrl, supabasePublishableKey)

  return client
}

