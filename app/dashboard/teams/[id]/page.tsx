import { createClient } from "@/lib/supabase/server"
import { getTeamWithClient, getTeamMembersWithClient, TeamDetailClient } from "@/features/teams"
import { notFound } from "next/navigation"

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const [team, members] = await Promise.all([
    getTeamWithClient(supabase, id).catch(() => null),
    getTeamMembersWithClient(supabase, id).catch(() => [])
  ])

  if (!team) {
    notFound()
  }

  return <TeamDetailClient initialTeam={team} initialMembers={members} />
}
