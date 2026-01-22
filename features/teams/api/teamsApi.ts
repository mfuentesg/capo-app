/**
 * Teams API - Supabase REST API functions
 *
 * Pure functions for data fetching and mutations.
 * No React hooks, no side effects beyond Supabase calls.
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types"
import { mockTeams } from "@/lib/mock-data"

export async function getTeams(supabase: SupabaseClient<Database>): Promise<Tables<"teams">[]> {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) {
    if (process.env.NODE_ENV === "development") {
      return mockTeams
    }
    throw userError
  }

  if (!user) {
    if (process.env.NODE_ENV === "development") {
      return mockTeams
    }
    return []
  }

  return getTeamsWithClient(supabase, user.id)
}

export async function getTeamsWithClient(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Tables<"teams">[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      team:teams (
        id,
        name,
        description,
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
    if (process.env.NODE_ENV === "development") {
      return mockTeams
    }
    throw error
  }

  const teams: Tables<"teams">[] = []
  for (const item of data || []) {
    const team = item.team as unknown as Tables<"teams"> | null
    if (team) {
      teams.push(team)
    }
  }

  if (teams.length === 0 && process.env.NODE_ENV === "development") {
    return mockTeams
  }

  return teams
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
  try {
    const response = await supabase.from("teams").select("*").eq("id", teamId).single()
    const { data, error } = response

    if (error) {
      if (error.code === "PGRST116" && process.env.NODE_ENV === "development") {
        const mockTeam = mockTeams.find((t) => t.id === teamId)
        if (mockTeam) return mockTeam
        return null
      }
      if (error.code === "PGRST116") return null
      if (process.env.NODE_ENV === "development") {
        const mockTeam = mockTeams.find((t) => t.id === teamId)
        if (mockTeam) return mockTeam
      }
      throw error
    }

    if (!data && process.env.NODE_ENV === "development") {
      const mockTeam = mockTeams.find((t) => t.id === teamId)
      if (mockTeam) return mockTeam
    }

    return data || null
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      const mockTeam = mockTeams.find((t) => t.id === teamId)
      if (mockTeam) return mockTeam
    }
    throw error
  }
}

export async function createTeam(
  supabase: SupabaseClient<Database>,
  team: TablesInsert<"teams">
): Promise<Tables<"teams">> {
  const { data, error } = await supabase.from("teams").insert(team).select().single()

  if (error) throw error
  return data
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

export async function getTeamMembers(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<Tables<"team_members">[]> {
  return getTeamMembersWithClient(supabase, teamId)
}

export async function getTeamMembersWithClient(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<Tables<"team_members">[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId)
    .order("joined_at", { ascending: true })

  if (error) {
    if (process.env.NODE_ENV === "development") {
      return []
    }
    throw error
  }
  return data || []
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
