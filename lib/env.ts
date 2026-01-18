export type RequiredEnvVars = {
  supabaseUrl: string
  supabasePublishableKey: string
  googleClientId: string
  googleSecret: string
}

export type OptionalEnvVars = {
  siteUrl?: string
}

export const env: {
  required: RequiredEnvVars
  optional: OptionalEnvVars
} = {
  required: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
    googleClientId: process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID as string,
    googleSecret: process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET as string
  },
  optional: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL
  }
}
