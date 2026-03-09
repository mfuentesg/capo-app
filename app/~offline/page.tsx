"use client"

import Link from "next/link"
import { WifiOff } from "lucide-react"
import { OptimizedLogo } from "@/components/optimized-logo"
import { useTranslation } from "@/hooks/use-translation"

export default function OfflinePage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-0 -left-20 h-[500px] w-[500px] rounded-full bg-violet-500/8 blur-[120px]" />
      </div>

      <div className="mb-8">
        <OptimizedLogo name="capo" alt="Capo" width={56} height={56} className="opacity-80 dark:invert" />
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-6">
        <WifiOff className="h-8 w-8 text-muted-foreground" />
      </div>

      <h1 className="text-2xl font-semibold tracking-tight mb-2">{t.offline.title}</h1>
      <p className="text-muted-foreground max-w-sm mb-8">{t.offline.description}</p>

      <Link
        href="/"
        className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        {t.common.tryAgain}
      </Link>
    </div>
  )
}
