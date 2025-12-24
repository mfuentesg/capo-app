"use client"

import { useState, useLayoutEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { useLocale } from "@/contexts/locale-context"
import { useSignInWithGoogle } from "@/features/auth/hooks"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const { t } = useLocale()
  const searchParams = useSearchParams()
  const signInWithGoogle = useSignInWithGoogle()
  const [isLoading, setIsLoading] = useState(false)
  const errorRef = useRef<string | null>(null)

  // Reset loading state on error
  // We're synchronizing with URL search params (external system), so using an effect is correct
  useLayoutEffect(() => {
    const error = searchParams.get("error")
    const previousError = errorRef.current

    if (error && error !== previousError && isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false)
    }

    errorRef.current = error
  }, [searchParams, isLoading])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle.mutateAsync()
      // Keep loading state - redirect will happen
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex items-center justify-center rounded-md">
                <Image
                  src="/img/capo.svg"
                  alt="Capo App"
                  width={150}
                  height={150}
                  className="text-foreground dark:invert"
                  style={{ color: "hsl(var(--foreground))" }}
                />
              </div>
              <span className="sr-only">Capo App</span>
            </a>
            <h1 className="text-xl font-bold">{t.auth.welcomeToCapo}</h1>
            <h2 className="text-muted-foreground">{t.auth.signInDescription}</h2>
          </div>
          <Field className="flex justify-center items-center">
            <Button
              variant="outline"
              type="button"
              className="max-w-9/12 p-4"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className={cn("h-5 w-5", isLoading && "animate-spin")}
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                {isLoading ? (
                  <span>{t.auth.loggingIn}</span>
                ) : (
                  <span>{t.auth.loginWith.replace("{provider}", "Google")}</span>
                )}
              </div>
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
