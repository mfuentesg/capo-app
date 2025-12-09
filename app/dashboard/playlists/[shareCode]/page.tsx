import { notFound } from "next/navigation"
import { PlaylistShareView } from "@/features/playlist-sharing"
import type { Playlist } from "@/types"

// Mock function - replace with actual API call
async function getPlaylistByShareCode(shareCode: string): Promise<Playlist | null> {
  // TODO: Fetch from database
  // For now, return mock data for demonstration
  if (shareCode === "ABC123") {
    return {
      id: "1",
      name: "Domingo 7 diciembre",
      songs: ["1", "2", "3"],
      isDraft: false,
      date: "2024-12-07",
      visibility: "public",
      shareCode: "ABC123",
      allowGuestEditing: false,
      createdAt: "2024-12-07T00:00:00.000Z",
      updatedAt: "2024-12-07T00:00:00.000Z"
    }
  }
  return null
}

export default async function PlaylistSharePage({
  params
}: {
  params: Promise<{ shareCode: string }>
}) {
  const { shareCode } = await params
  const playlist = await getPlaylistByShareCode(shareCode)

  if (!playlist || playlist.visibility !== "public") {
    notFound()
  }

  return <PlaylistShareView playlist={playlist} />
}
