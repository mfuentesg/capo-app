import type { Metadata } from "next"
import { getSelectedTeamId } from "@/features/app-context/server"
import { TeamsClient, api } from "@/features/teams"

export const metadata: Metadata = {
  title: "Teams",
  robots: { index: false, follow: false }
}

export default async function TeamsPage() {
  const [initialTeams, initialSelectedTeamId] = await Promise.all([
    api.getTeams().catch(() => []),
    getSelectedTeamId()
  ])

  return (
    <TeamsClient initialTeams={initialTeams} initialSelectedTeamId={initialSelectedTeamId} />
  )
}
