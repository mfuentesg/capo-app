import { createClient } from "@/lib/supabase/server"
import { getTeamsWithClient, TeamsClient } from "@/features/teams"
import { getSelectedTeamIdFromCookies } from "@/features/app-context/cookies"

export default async function TeamsPage() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const teams = user ? await getTeamsWithClient(supabase, user.id) : []
  const initialSelectedTeamId = await getSelectedTeamIdFromCookies()

  return <TeamsClient initialTeams={teams} initialSelectedTeamId={initialSelectedTeamId} />
}
