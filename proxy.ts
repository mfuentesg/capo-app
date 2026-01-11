import { NextResponse, type NextRequest } from "next/server"
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr"
import { DEFAULT_REDIRECT_PATH, LOGIN_PATH } from "@/lib/supabase/constants"

interface SupabaseEnvVars {
  supabaseUrl: string
  supabasePublishableKey: string
}

type CookieToSet = {
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
}

function validateEnvVars(): SupabaseEnvVars | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    return null
  }

  return { supabaseUrl, supabasePublishableKey }
}

function createSupabaseClient(
  request: NextRequest,
  envVars: SupabaseEnvVars,
  cookiesToSet: CookieToSet[]
) {
  const cookies: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSetFromSupabase) {
      cookiesToSetFromSupabase.forEach(({ name, value, options }) => {
        request.cookies.set(name, value)
        cookiesToSet.push({ name, value, options })
      })
    }
  }

  return createServerClient(envVars.supabaseUrl, envVars.supabasePublishableKey, {
    cookies
  })
}

function applyCookiesToResponse(response: NextResponse, cookiesToSet: CookieToSet[]): void {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })
}

function shouldRedirectToDashboard(user: unknown): boolean {
  return !!user
}

function shouldRedirectToLogin(user: unknown, error: unknown): boolean {
  return !!error || !user
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const envVars = validateEnvVars()

  if (!envVars) {
    return NextResponse.next()
  }

  try {
    const cookiesToSet: CookieToSet[] = []
    const supabase = createSupabaseClient(request, envVars, cookiesToSet)

    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    let response: NextResponse = NextResponse.next()

    if (pathname === "/" && shouldRedirectToDashboard(user)) {
      response = NextResponse.redirect(new URL(DEFAULT_REDIRECT_PATH, request.url))
    } else if (pathname.startsWith("/dashboard") && shouldRedirectToLogin(user, error)) {
      response = NextResponse.redirect(new URL(LOGIN_PATH, request.url))
    }

    applyCookiesToResponse(response, cookiesToSet)
    return response
  } catch (error) {
    console.error("Error in proxy:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/", "/dashboard/:path*"]
}
