export type RequiredEnvVars = {
  supabaseUrl: string
  supabasePublishableKey: string
}

export type OptionalEnvVars = {
  siteUrl?: string
}

// Access NEXT_PUBLIC_* variables directly - dynamic access like process.env[name]
// doesn't work because Next.js only inlines variables at build time when accessed directly
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

export const env: {
  required: RequiredEnvVars
  optional: OptionalEnvVars
} = {
  required: {
    supabaseUrl,
    supabasePublishableKey
  },
  optional: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL
  }
}
