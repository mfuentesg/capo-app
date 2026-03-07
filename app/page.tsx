import type { Metadata } from "next"
import { LoginForm } from "@/features/auth"
import { ThemeToggle } from "@/components/layout"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Capo to access your personal song library with chords and lyrics.",
  robots: { index: false, follow: false }
}

export default function LoginPage() {
  return (
    <div className="bg-background relative flex min-h-svh flex-col items-center justify-center p-4 sm:p-8">
      {/* Ambient top glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-40 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklch, var(--primary) 10%, transparent), transparent 70%)"
          }}
        />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="bg-card border-border relative w-full max-w-sm rounded-2xl border p-8 shadow-lg">
        <LoginForm />
      </div>
    </div>
  )
}

