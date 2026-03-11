import type { Metadata } from "next"
import { api, TeamDetailClient } from "@/features/teams"
import { notFound } from "next/navigation"
import type { Tables } from "@/lib/supabase/database.types"
import { createClient } from "@/lib/supabase/server"
import type { UserInfo } from "@/features/auth"

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
  const supabase = await createClient()
  const [{ data: authData }, team, members, invitations] = await Promise.all([
    supabase.auth.getUser(),
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

  const initialUser: UserInfo | null = authData.user
    ? {
        id: authData.user.id,
        email: authData.user.email,
        avatarUrl: (authData.user.user_metadata?.avatar_url as string | undefined) || undefined,
        fullName: (authData.user.user_metadata?.full_name as string | undefined) || undefined,
        displayName: (authData.user.user_metadata?.name as string | undefined) || undefined
      }
    : null

  return (
    <TeamDetailClient
      initialTeam={team}
      initialMembers={members}
      initialInvitations={invitations}
      initialUser={initialUser}
    />
  )
}
