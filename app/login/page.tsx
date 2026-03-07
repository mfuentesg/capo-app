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
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
