import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_REDIRECT_PATH } from "@/lib/supabase/constants"

/**
 * Validates redirect URL to prevent open redirects
 * Only allows same-origin URLs or relative paths
 */
function isValidRedirect(url: string | null, requestOrigin: string): boolean {
  if (!url) {
    return false
  }

  // Allow relative paths (starting with /)
  if (url.startsWith("/")) {
    return true
  }

  try {
    const parsedUrl = new URL(url, requestOrigin)
    // Only allow same origin redirects
    return parsedUrl.origin === new URL(requestOrigin).origin
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")

  // Validate redirect URL to prevent open redirects
  const redirectTo = isValidRedirect(next, requestUrl.origin) && next ? next : DEFAULT_REDIRECT_PATH

  if (!code) {
    const loginUrl = new URL("/", requestUrl.origin)
    loginUrl.searchParams.set("error", "missing_code")
    return NextResponse.redirect(loginUrl)
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const loginUrl = new URL("/", requestUrl.origin)
      loginUrl.searchParams.set("error", "auth_failed")

      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
  } catch (error) {
    console.error("Unexpected error during auth callback:", error)
    // Redirect to login with error
    const loginUrl = new URL("/", requestUrl.origin)
    loginUrl.searchParams.set("error", "auth_error")
    return NextResponse.redirect(loginUrl)
  }
}
