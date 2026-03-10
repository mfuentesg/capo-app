"use client"

import dynamic from "next/dynamic"

const FeedbackFormLazy = dynamic(
  () => import("@/features/feedback").then((mod) => mod.FeedbackForm),
  {
    ssr: false,
    loading: () => null
  }
)

interface LandingFeedbackSectionProps {
  badge: string
  headline: string
  description: string
}

export function LandingFeedbackSection({ badge, headline, description }: LandingFeedbackSectionProps) {
  return (
    <section className="relative px-4 py-24 sm:py-32" id="feedback">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            {badge}
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{headline}</h2>
          <p className="max-w-lg text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/60 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <FeedbackFormLazy />
        </div>
      </div>
    </section>
  )
}

