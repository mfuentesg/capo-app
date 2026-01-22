import { redirect } from "next/navigation"
import { getAppContext } from "@/features/app-context/server"
import { SongsClient, api } from "@/features/songs"

export default async function SongsPage() {
  const context = await getAppContext()
  if (!context) {
    redirect("/")
  }
  const songs = await api.getSongs(context)

  return <SongsClient initialSongs={songs} />
}
