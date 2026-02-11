import { api, TeamDetailClient } from "@/features/teams"
import { notFound } from "next/navigation"
import type { Tables } from "@/lib/supabase/database.types"

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [team, members] = await Promise.all([
    api.getTeam(id),
    api.getTeamMembers(id) as Promise<
      (Tables<"team_members"> & { user_full_name: string | null })[]
    >
  ])

  if (!team) {
    notFound()
  }

  return <TeamDetailClient initialTeam={team} initialMembers={members} />
}
