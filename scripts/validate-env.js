const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID",
  "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET"
]

const missing = required.filter((v) => !process.env[v])

if (missing.length > 0) {
  console.error("\n❌ Missing required environment variables:\n")
  missing.forEach((v) => console.error(`  - ${v}`))
  console.error("\nPlease add them to your .env.local file.\n")
  process.exit(1)
}

console.log("✅ All required environment variables are set")
