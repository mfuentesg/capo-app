import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAppContext } from "@/features/app-context/server"
import { api } from "@/features/dashboard"
import DashboardClient from "./dashboard-client"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false }
}

export default async function DashboardPage() {
  const context = await getAppContext()
  if (!context) {
    redirect("/")
  }

  const [initialStats, initialRecentSongs] = await Promise.all([
    api.getDashboardStats(context).catch(() => ({
      totalSongs: 0,
      totalPlaylists: 0,
      songsThisMonth: 0,
      upcomingPlaylists: 0
    })),
    api.getRecentSongs(context, 3).catch(() => [])
  ])

  return <DashboardClient initialStats={initialStats} initialRecentSongs={initialRecentSongs} />
}
