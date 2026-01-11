import { LyricsView } from "@/features/lyrics-editor"
import { mockSongWithLyrics } from "@/lib/mock-data"

export default async function SongLyricsPage({ params }: { params: Promise<{ id: string }> }) {
  await params

  // TODO: Fetch song from database using ID

  return <LyricsView song={mockSongWithLyrics} />
}
