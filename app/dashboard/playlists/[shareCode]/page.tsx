import { redirect } from "next/navigation"

export default async function PlaylistSharePage({
  params
}: {
  params: Promise<{ shareCode: string }>
}) {
  const { shareCode } = await params
  redirect(`/playlists/${shareCode}`)
}
