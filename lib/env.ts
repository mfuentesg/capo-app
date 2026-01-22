export type RequiredEnvVars = {
  supabaseUrl: string
  supabasePublishableKey: string
  googleClientId: string
  googleSecret: string
}

export type OptionalEnvVars = {
  siteUrl?: string
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing ${name} environment variable. Please add it to your .env.local file.`)
  }
  return value
}

export const env: {
  required: RequiredEnvVars
  optional: OptionalEnvVars
} = {
  required: {
    supabaseUrl: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabasePublishableKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    googleClientId: getRequiredEnv("SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID"),
    googleSecret: getRequiredEnv("SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET")
  },
  optional: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL
  }
}
