import { NextResponse, type NextRequest } from "next/server"
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr"
import { DEFAULT_REDIRECT_PATH } from "@/lib/supabase/constants"

/**
 * Validates required environment variables for Supabase
 */
function validateEnvVars() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    return null
  }

  return { supabaseUrl, supabasePublishableKey }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only handle redirect for home page
  if (pathname === "/") {
    const envVars = validateEnvVars()
    if (!envVars) {
      // If env vars are missing, continue without redirect
      return NextResponse.next()
    }

    try {
      let response = NextResponse.next()
      // Use the same type that SetAllCookies expects
      const cookiesToSet: Array<{
        name: string
        value: string
        options: Partial<{
          httpOnly?: boolean
          secure?: boolean
          sameSite?: boolean | "strict" | "lax" | "none"
          maxAge?: number
          path?: string
          domain?: string
          expires?: Date
        }>
      }> = []

      // Create Supabase client for proxy (Edge Runtime compatible)
      // Using CookieMethodsServer type to ensure we use the non-deprecated overload
      const cookies: CookieMethodsServer = {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSetFromSupabase) {
          // Track cookies that need to be set
          cookiesToSetFromSupabase.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            cookiesToSet.push({ name, value, options })
          })
        }
      }

      const supabase = createServerClient(envVars.supabaseUrl, envVars.supabasePublishableKey, {
        cookies
      })

      const {
        data: { user }
      } = await supabase.auth.getUser()

      // If user is authenticated, redirect to dashboard
      if (user) {
        response = NextResponse.redirect(new URL(DEFAULT_REDIRECT_PATH, request.url))
      }

      // Apply any cookie updates to the response
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })

      return response
    } catch (error) {
      // If there's an error checking user, allow the request to continue
      // This prevents blocking access if Supabase is unavailable
      console.error("Error checking user in proxy:", error)
    }
  }

  // Continue with the request
  return NextResponse.next()
}

export const config = {
  matcher: "/"
}
