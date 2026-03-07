import type { Metadata } from "next"
import { LoginForm, LandingFeatures } from "@/features/auth"
import { ThemeToggle } from "@/components/layout"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Capo to access your personal song library with chords and lyrics.",
  robots: { index: false, follow: false }
}

export default function LoginPage() {
  return (
    <div className="bg-background relative min-h-svh">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="grid min-h-svh lg:grid-cols-[1fr_420px]">
        {/* Landing / hero panel — hidden on mobile */}
        <div className="from-primary/5 to-background relative hidden flex-col justify-between bg-gradient-to-br p-10 lg:flex">
          <LandingFeatures className="my-auto max-w-md" />
          <p className="text-muted-foreground text-xs">{metadata.description as string}</p>
        </div>

        {/* Login panel */}
        <div className="border-border flex min-h-svh flex-col items-center justify-center gap-6 p-8 lg:min-h-0 lg:border-l">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}

