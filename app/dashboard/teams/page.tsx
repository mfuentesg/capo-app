import { api, TeamsClient } from "@/features/teams"
import { getSelectedTeamId } from "@/features/app-context/server"

export default async function TeamsPage() {
  const teams = await api.getTeams()
  const initialSelectedTeamId = await getSelectedTeamId()

  return <TeamsClient initialTeams={teams} initialSelectedTeamId={initialSelectedTeamId} />
}
