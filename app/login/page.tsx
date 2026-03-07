import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/features/auth"
import { ThemeToggle } from "@/components/layout"
import { OptimizedLogo } from "@/components/optimized-logo"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Capo to access your personal song library with chords and lyrics.",
  robots: { index: false, follow: false }
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      {/* Background gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-violet-500/8 blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold">
          <OptimizedLogo name="capo" alt="Capo" width={28} height={28} priority className="dark:invert" />
          Capo
        </Link>
        <ThemeToggle />
      </header>

      {/* Centered card */}
      <main className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-sm">
            <LoginForm />
          </div>

          {/* Back link */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors underline underline-offset-4">
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
