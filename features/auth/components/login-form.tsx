"use client"

import { useState, useLayoutEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { OptimizedLogo } from "@/components/optimized-logo"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocale } from "@/features/settings"
import { useSignInWithGoogle } from "@/features/auth/hooks"
import { Music, FileText, ListMusic, Users, Share2, Guitar } from "lucide-react"

interface LoginFormProps extends React.ComponentProps<"div"> {
  showLogo?: boolean
}

function getErrorMessage(
  error: string | null,
  t: ReturnType<typeof useLocale>["t"]
): string | null {
  if (!error) return null
  switch (error) {
    case "auth_failed":
      return t.auth.errorAuthFailed
    case "auth_error":
      return t.auth.errorAuthError
    case "missing_code":
      return t.auth.errorMissingCode
    default:
      return t.auth.errorGeneric
  }
}

const FEATURE_DOTS = [
  { Icon: Music, color: "text-blue-500", bg: "bg-blue-500/10" },
  { Icon: FileText, color: "text-violet-500", bg: "bg-violet-500/10" },
  { Icon: ListMusic, color: "text-primary", bg: "bg-primary/10" },
  { Icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
  { Icon: Share2, color: "text-pink-500", bg: "bg-pink-500/10" },
  { Icon: Guitar, color: "text-amber-500", bg: "bg-amber-500/10" }
]

export function LoginForm({ className, showLogo = true, ...props }: LoginFormProps) {
  const { t } = useLocale()
  const searchParams = useSearchParams()
  const signInWithGoogle = useSignInWithGoogle()
  const [isLoading, setIsLoading] = useState(false)
  const errorRef = useRef<string | null>(null)

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
    } catch {
      setIsLoading(false)
    }
  }

  const errorMessage = getErrorMessage(searchParams.get("error"), t)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {showLogo && (
        <div className="flex items-center justify-center">
          <OptimizedLogo
            name="capo"
            alt={t.common.capoApp}
            width={56}
            height={56}
            priority
            className="dark:invert"
          />
        </div>
      )}

      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-bold">{t.auth.welcomeToCapo}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.signInDescription}</p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <span className="mt-0.5 shrink-0 text-base leading-none">⚠</span>
          {errorMessage}
        </div>
      )}

      {/* Social providers */}
      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          type="button"
          className="h-11 w-full gap-3 font-medium"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={cn("h-4 w-4 shrink-0", isLoading && "animate-spin")}
          >
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          {isLoading ? t.auth.loggingIn : t.auth.loginWith.replace("{provider}", t.common.google)}
        </Button>

        <div className="relative">
          <Button
            variant="outline"
            type="button"
            className="h-11 w-full gap-3 font-medium opacity-50"
            disabled
            aria-label={t.auth.loginWith.replace("{provider}", t.auth.githubLabel)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0"
              fill="currentColor"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {t.auth.loginWith.replace("{provider}", t.auth.githubLabel)}
          </Button>
          <span className="absolute -top-2.5 right-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border/50">
            {t.auth.githubComingSoon}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {t.auth.orContinueWith}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Magic link — coming soon */}
      <div className="relative flex flex-col gap-2">
        <div className="flex gap-2 opacity-50">
          <Input
            type="email"
            placeholder={t.auth.emailPlaceholder}
            disabled
            className="h-11 flex-1"
          />
          <Button variant="outline" type="button" disabled className="h-11 shrink-0 px-4">
            {t.auth.sendMagicLink}
          </Button>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">{t.auth.magicLinkDescription}</p>
        <span className="absolute -top-2.5 right-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border/50">
          {t.auth.githubComingSoon}
        </span>
      </div>

      {/* Feature-color footer — mirrors landing page section palette */}
      <div className="flex items-center justify-center gap-2 pt-1" aria-hidden>
        {FEATURE_DOTS.map(({ Icon, color, bg }, i) => (
          <div key={i} className={cn("flex items-center justify-center rounded-full p-1.5", bg)}>
            <Icon className={cn("h-3 w-3", color)} />
          </div>
        ))}
      </div>
    </div>
  )
}
