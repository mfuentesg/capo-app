import { LyricsView } from "@/features/lyrics-editor"
import { api } from "@/features/songs/api"
import { notFound } from "next/navigation"

export default async function SongLyricsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const song = await api.getSong(id)

  if (!song) {
    notFound()
  }

  return <LyricsView song={song} />
}
