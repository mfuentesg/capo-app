"use client"

import { LoginForm } from "@/features/auth"
import { ThemeToggle } from "@/components/layout"
import { Music, Users, Sparkles, Layout } from "lucide-react"
import { useLocale } from "@/features/settings"

export default function LoginPage() {
  const { t } = useLocale()

  return (
    <main className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-0">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="grid w-full h-full max-w-6xl md:grid-cols-2 rounded-2xl overflow-hidden border shadow-2xl bg-card">
        {/* Left Side: Features/Value Prop (Desktop Only) */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-primary text-primary-foreground">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">{t.landing.title}</h2>
              <p className="text-primary-foreground/80 text-lg">
                {t.landing.subtitle}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
                  <Music className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{t.landing.chordProTitle}</h3>
                  <p className="text-sm text-primary-foreground/70">{t.landing.chordProDesc}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
                  <Layout className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{t.landing.playlistsTitle}</h3>
                  <p className="text-sm text-primary-foreground/70">{t.landing.playlistsDesc}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{t.landing.teamsTitle}</h3>
                  <p className="text-sm text-primary-foreground/70">{t.landing.teamsDesc}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{t.landing.performanceTitle}</h3>
                  <p className="text-sm text-primary-foreground/70">{t.landing.performanceDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex items-center justify-center p-8 md:p-12 bg-background">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  )
}
