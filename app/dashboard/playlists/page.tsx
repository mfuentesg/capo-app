import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAppContext } from "@/features/app-context/server"
import { PlaylistsClient, api } from "@/features/playlists"

export const metadata: Metadata = {
  title: "Playlists",
  robots: { index: false, follow: false }
}

export default async function PlaylistsPage() {
  const context = await getAppContext()
  if (!context) {
    redirect("/")
  }

  const initialPlaylists = await api.getPlaylists(context).catch(() => [])

  return <PlaylistsClient initialPlaylists={initialPlaylists} />
}
