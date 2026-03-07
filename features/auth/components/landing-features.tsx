"use client"

import { Music, ListMusic, Users, Share2 } from "lucide-react"
import { OptimizedLogo } from "@/components/optimized-logo"
import { cn } from "@/lib/utils"
import { useLocale } from "@/features/settings"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="text-primary mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export function LandingFeatures({ className }: { className?: string }) {
  const { t } = useLocale()

  const features = [
    {
      icon: <Music className="h-5 w-5" />,
      title: t.auth.landing.features.songs.title,
      description: t.auth.landing.features.songs.description
    },
    {
      icon: <ListMusic className="h-5 w-5" />,
      title: t.auth.landing.features.playlists.title,
      description: t.auth.landing.features.playlists.description
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: t.auth.landing.features.teams.title,
      description: t.auth.landing.features.teams.description
    },
    {
      icon: <Share2 className="h-5 w-5" />,
      title: t.auth.landing.features.sharing.title,
      description: t.auth.landing.features.sharing.description
    }
  ]

  return (
    <div className={cn("flex flex-col justify-center gap-8 px-2", className)}>
      <div className="flex flex-col gap-4">
        <OptimizedLogo
          name="capo"
          alt={t.common.capoApp}
          width={64}
          height={64}
          priority
          className="dark:invert"
        />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{t.auth.landing.headline}</h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            {t.auth.landing.subheadline}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  )
}
