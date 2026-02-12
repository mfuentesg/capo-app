/**
 * Teams API - Supabase REST API functions
 *
 * Pure functions for data fetching and mutations.
 * No React hooks, no side effects beyond Supabase calls.
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types"

export type TeamWithMemberCount = Tables<"teams"> & { member_count: number }

export async function getTeams(supabase: SupabaseClient<Database>): Promise<TeamWithMemberCount[]> {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    return []
  }

  return getTeamsWithClient(supabase, user.id)
}

export async function getTeamsWithClient(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<TeamWithMemberCount[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      team:teams (
        id,
        name,
        avatar_url,
        icon,
        is_public,
        created_at,
        created_by,
        updated_at
      ),
      role
    `
    )
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })

  if (error) {
    throw error
  }

  const teams: Tables<"teams">[] = []
  for (const item of data || []) {
    const team = item.team as unknown as Tables<"teams"> | null
    if (team) {
      teams.push(team)
    }
  }

  // Fetch member counts for all teams
  if (teams.length === 0) {
    return []
  }

  const teamIds = teams.map((t) => t.id)
  const { data: memberCounts, error: countError } = await supabase
    .from("team_members")
    .select("team_id")
    .in("team_id", teamIds)

  if (countError) {
    throw countError
  }

  // Count members per team
  const countMap = new Map<string, number>()
  for (const row of memberCounts || []) {
    countMap.set(row.team_id, (countMap.get(row.team_id) || 0) + 1)
  }

  return teams.map((team) => ({
    ...team,
    member_count: countMap.get(team.id) || 1
  }))
}

export async function getTeam(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<Tables<"teams"> | null> {
  return getTeamWithClient(supabase, teamId)
}

export async function getTeamWithClient(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<Tables<"teams"> | null> {
  const { data, error } = await supabase.from("teams").select("*").eq("id", teamId).single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }

  return data || null
}

export async function createTeam(
  supabase: SupabaseClient<Database>,
  team: TablesInsert<"teams">
): Promise<Tables<"teams">> {
  // Use the database function instead of direct insert
  // This ensures proper authentication context and creates team membership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const result: { data: Tables<"teams">[] | null; error: any } = await (supabase.rpc as any)(
    "create_team_with_owner",
    {
      team_name: team.name,
      team_is_public: team.is_public || false,
      team_icon: team.icon || null
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error: rpcError } = result

  if (rpcError) throw rpcError
  if (!Array.isArray(data) || data.length === 0) throw new Error("Failed to create team")

  // The RPC returns the full team object
  return data[0]
}

export async function updateTeam(
  supabase: SupabaseClient<Database>,
  teamId: string,
  updates: TablesUpdate<"teams">
): Promise<Tables<"teams">> {
  const { data, error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", teamId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTeam(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<void> {
  const { error } = await supabase.from("teams").delete().eq("id", teamId)
  if (error) throw error
}

export async function leaveTeam(supabase: SupabaseClient<Database>, teamId: string): Promise<void> {
  // leave_team RPC exists in DB but is not yet in generated types.
  // Regenerate types with `pnpm types:generate` to remove this cast.
  const rpc = supabase.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ error: { message: string; code: string } | null }>
  const { error } = await rpc("leave_team", { target_team_id: teamId })
  if (error) throw error
}

export async function getTeamMembers(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<(Tables<"team_members"> & { user_full_name: string | null })[]> {
  return getTeamMembersWithClient(supabase, teamId)
}

export async function getTeamMembersWithClient(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<(Tables<"team_members"> & { user_full_name: string | null })[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select(`*, profiles!user_id(full_name)`)
    .eq("team_id", teamId)
    .order("joined_at", { ascending: true })

  if (error) {
    throw error
  }

  // Map results to include user_full_name at the top level
  type MemberWithProfile = Tables<"team_members"> & {
    profiles: { full_name: string | null } | null
  }
  return (
    (data as MemberWithProfile[] | null)?.map((item) => ({
      ...item,
      user_full_name: item.profiles?.full_name || null
    })) || []
  )
}

export async function getTeamInvitations(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<Tables<"team_invitations">[]> {
  const { data, error } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("team_id", teamId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function acceptTeamInvitation(
  supabase: SupabaseClient<Database>,
  token: string
): Promise<string> {
  const { data, error } = await supabase.rpc("accept_team_invitation", {
    invitation_token: token
  })

  if (error) throw error
  return data as string
}

export async function deleteTeamInvitation(
  supabase: SupabaseClient<Database>,
  invitationId: string
): Promise<void> {
  const { error } = await supabase.from("team_invitations").delete().eq("id", invitationId)

  if (error) throw error
}

export async function changeTeamMemberRole(
  supabase: SupabaseClient<Database>,
  teamId: string,
  userId: string,
  newRole: Tables<"team_members">["role"]
): Promise<void> {
  const { error } = await supabase.rpc("change_team_member_role", {
    target_team_id: teamId,
    target_user_id: userId,
    new_role: newRole
  })

  if (error) throw error
}

export async function transferTeamOwnership(
  supabase: SupabaseClient<Database>,
  teamId: string,
  newOwnerId: string
): Promise<void> {
  const { error } = await supabase.rpc("transfer_team_ownership", {
    target_team_id: teamId,
    new_owner_id: newOwnerId
  })

  if (error) throw error
}

export async function inviteTeamMember(
  supabase: SupabaseClient<Database>,
  teamId: string,
  email: string,
  role: Tables<"team_invitations">["role"] = "member"
): Promise<Tables<"team_invitations">> {
  // invite_team_member RPC exists in DB but is not yet in generated types.
  // Regenerate types with `pnpm types:generate` to remove this cast.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("invite_team_member", {
    target_team_id: teamId,
    member_email: email,
    member_role: role
  })

  if (error) throw error
  if (!data) throw new Error("Failed to create invitation")
  return data
}

export async function removeTeamMember(
  supabase: SupabaseClient<Database>,
  teamId: string,
  userId: string
): Promise<void> {
  // remove_team_member RPC exists in DB but is not yet in generated types.
  // Regenerate types with `pnpm types:generate` to remove this cast.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.rpc as any)("remove_team_member", {
    target_team_id: teamId,
    target_user_id: userId
  })

  if (error) throw error
}
