import { notFound } from "next/navigation"
import { PlaylistShareView } from "@/features/playlist-sharing"
import { getPlaylistByShareCode } from "@/lib/mock-data"

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
