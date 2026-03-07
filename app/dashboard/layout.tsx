import type React from "react"
import { Navbar, BottomNav } from "@/components/layout"
import { DraftIndicator } from "@/components/layout/draft-indicator"
import { PlaylistDraftProvider } from "@/features/playlist-draft"

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PlaylistDraftProvider>
      <main className="flex-1 pb-16 md:pb-0">
        <Navbar />
        {children}
        <DraftIndicator />
        <BottomNav />
      </main>
    </PlaylistDraftProvider>
  )
}
