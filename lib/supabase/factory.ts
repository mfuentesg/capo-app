/**
 * Auto-Context API Helper
 *
 * Creates the appropriate API wrapper based on execution context.
 */

import type { Database } from "./database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"
import { env } from "@/lib/env"

type ContextType = "server" | "client"

function getContext(): ContextType {
  return typeof window === "undefined" ? "server" : "client"
}

function getBrowserClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(
    env.required.supabaseUrl,
    env.required.supabasePublishableKey
  )
}

type AnyFunction = (...args: any[]) => any // eslint-disable-line @typescript-eslint/no-explicit-any

type TransformedApi<M extends Record<string, AnyFunction>> = {
  [K in keyof M]: M[K] extends AnyFunction
    ? (...args: Tail<Parameters<M[K]>>) => ReturnType<M[K]>
    : M[K]
}

type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : [] // eslint-disable-line @typescript-eslint/no-explicit-any

export function createApi<M extends Record<string, AnyFunction>>(module: M): TransformedApi<M> {
  const context = getContext()

  if (context === "server") {
    return createServerApi(module) as TransformedApi<M>
  } else {
    return createClientApi(module) as TransformedApi<M>
  }
}

function createServerApi<M extends Record<string, AnyFunction>>(module: M): M {
  const api = {} as M

  for (const [key, fn] of Object.entries(module)) {
    if (typeof fn === "function") {
      ;(api as Record<string, unknown>)[key] = async (...args: Parameters<typeof fn>) => {
        const { cookies } = await import("next/headers")
        const { createServerClient } = await import("@supabase/ssr")

        const cookieStore = await cookies()
        const supabase = createServerClient(
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
                } catch {
                  // Called from Server Component - can be ignored
                }
              }
            }
          }
        )

        return fn(supabase as Parameters<typeof fn>[0], ...args)
      }
    }
  }

  return api
}

function createClientApi<M extends Record<string, AnyFunction>>(module: M): M {
  const supabase = getBrowserClient()

  const api = {} as M

  for (const [key, fn] of Object.entries(module)) {
    if (typeof fn === "function") {
      ;(api as Record<string, unknown>)[key] = (...args: Parameters<typeof fn>) => {
        return fn(supabase as Parameters<typeof fn>[0], ...args.slice(1))
      }
    }
  }

  return api
}

export function isServerSide(): boolean {
  return getContext() === "server"
}

export function isClientSide(): boolean {
  return getContext() === "client"
}
