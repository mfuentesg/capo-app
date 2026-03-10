import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAppContext } from "@/features/app-context/server"
import { SongsClient, api } from "@/features/songs"

export const metadata: Metadata = {
  title: "Songs",
  robots: { index: false, follow: false }
}

export default async function SongsPage() {
  const context = await getAppContext()
  if (!context) {
    redirect("/")
  }

  const initialSongs = await api.getSongs(context).catch(() => [])

  return <SongsClient initialSongs={initialSongs} />
}
