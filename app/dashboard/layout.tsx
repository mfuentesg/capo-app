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
      <main className="flex-1">
        <Navbar />
        {children}
        <DraftIndicator />
      </main>
    </PlaylistDraftProvider>
  )
}
