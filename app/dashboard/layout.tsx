import type React from "react"
import { Navbar } from "@/components/layout"
import { DraftIndicator } from "@/components/layout/draft-indicator"
import { PlaylistDraftProvider } from "@/features/playlist-draft"

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PlaylistDraftProvider>
      {/* Subtle gradient orbs — keeps visual language consistent with the landing page */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-0 -left-20 h-[500px] w-[500px] rounded-full bg-violet-500/8 blur-[120px]" />
      </div>
      <main className="flex-1">
        <Navbar />
        {children}
        <DraftIndicator />
      </main>
    </PlaylistDraftProvider>
  )
}
