import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/features/auth"
import { ThemeToggle } from "@/components/layout"
import { LanguageSwitcher } from "@/components/layout"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Capo to access your personal song library with chords and lyrics.",
  robots: { index: false, follow: false }
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-background px-4">
      {/* Background gradient orbs — same palette as landing */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 h-[400px] w-[400px] rounded-full bg-violet-500/8 blur-[100px]" />
      </div>

      {/* Controls — top right */}
      <div className="fixed top-3 right-4 z-10 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Form */}
      <div className="relative w-full max-w-sm">
        <LoginForm showLogo={false} />

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link
            href="/"
            className="hover:text-foreground transition-colors underline underline-offset-4"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
