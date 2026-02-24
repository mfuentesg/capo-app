import { api } from "@/features/songs/api"
import { notFound } from "next/navigation"
import { LyricsPageClient } from "./lyrics-page-client"

export default async function SongLyricsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const song = await api.getSong(id)

  if (!song) {
    notFound()
  }

  return <LyricsPageClient song={song} />
}
