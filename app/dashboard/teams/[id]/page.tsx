import { api, TeamDetailClient } from "@/features/teams"
import { notFound } from "next/navigation"

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [team, members] = await Promise.all([api.getTeam(id), api.getTeamMembers(id)])

  if (!team) {
    notFound()
  }

  return <TeamDetailClient initialTeam={team} initialMembers={members} />
}
