"use client"

import type React from "react"
import { Navbar } from "@/components/navbar"
import { PlaylistDraft } from "@/components/playlist-draft"
import { usePlaylistDraft } from "@/contexts/playlist-draft-context"

import "../globals.css"

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const { playlistDraft, isDraftOpen, setIsDraftOpen, clearDraft, removeFromDraft, reorderDraft } =
    usePlaylistDraft()

  return (
    <main className="flex-1">
      <Navbar />
      {children}
      <PlaylistDraft
        songs={playlistDraft}
        isOpen={isDraftOpen}
        onOpenChange={setIsDraftOpen}
        onClear={clearDraft}
        onRemove={removeFromDraft}
        onReorder={reorderDraft}
      />
    </main>
  )
}
