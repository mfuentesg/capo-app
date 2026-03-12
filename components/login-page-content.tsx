"use client"

import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { OptimizedLogo } from "@/components/optimized-logo"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { LoginForm } from "@/features/auth"
import { useLocale } from "@/features/settings"

export function LoginPageContent() {
  const { t } = useLocale()

  return (
    <div className="relative min-h-svh bg-background text-foreground">
      {/* Gradient orbs — same palette as landing / dashboard */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transform-gpu">
        <div className="absolute -top-48 -left-24 h-[560px] w-[560px] rounded-full bg-primary/18 blur-xl md:blur-3xl" />
        <div className="absolute top-1/3 right-0 h-[440px] w-[440px] rounded-full bg-violet-500/12 blur-xl md:blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[320px] w-[640px] rounded-full bg-primary/8 blur-lg md:blur-2xl" />
      </div>

      {/* Top-left — back link */}
      <div className="absolute left-4 top-4 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.common.backToHome}
        </Link>
      </div>

      {/* Top-right — controls */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      {/* Centered content */}
      <main className="flex min-h-svh flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-sm">
          {/* Brand mark */}
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 -z-10 scale-[2] rounded-full bg-primary/15 blur-2xl"
              />
              <div
                aria-hidden
                className="absolute inset-0 -z-10 scale-[1.5] translate-x-2 rounded-full bg-violet-500/10 blur-xl"
              />
              <OptimizedLogo
                name="capo"
                alt={t.common.capoApp}
                width={72}
                height={72}
                priority
                className="dark:invert"
              />
            </div>
            <div>
              <p className="text-sm leading-relaxed text-muted-foreground">{t.auth.tagline}</p>
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border/50 bg-card/80 p-6 shadow-2xl backdrop-blur-sm">
            <Suspense>
              <LoginForm showLogo={false} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
