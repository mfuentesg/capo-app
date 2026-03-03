import type { Metadata } from "next"
import { api, TeamDetailClient } from "@/features/teams"
import { notFound } from "next/navigation"
import type { Tables } from "@/lib/supabase/database.types"

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const team = await api.getTeam(id)

  if (!team) {
    return { title: "Team Not Found", robots: { index: false, follow: false } }
  }

  return {
    title: team.name,
    robots: { index: false, follow: false }
  }
}

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [team, members, invitations] = await Promise.all([
    api.getTeam(id),
    api.getTeamMembers(id) as Promise<
      (Tables<"team_members"> & {
        user_full_name: string | null
        user_email: string | null
        user_avatar_url: string | null
      })[]
    >,
    api.getTeamInvitations(id)
  ])

  if (!team) {
    notFound()
  }

  return (
    <TeamDetailClient
      initialTeam={team}
      initialMembers={members}
      initialInvitations={invitations}
    />
  )
}
