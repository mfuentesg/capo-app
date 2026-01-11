/**
 * Teams API - Supabase REST API functions
 *
 * Pure functions for data fetching and mutations.
 * No React hooks, no side effects beyond Supabase calls.
 */

import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types"
import { mockTeams } from "@/lib/mock-data"

/**
 * Fetch user's teams
 * Gets all teams the current user belongs to via team_members table
 * Uses client-side Supabase client
 *
 * @returns Promise<Tables<"teams">[]> - Array of teams user belongs to
 */
export async function getTeams(): Promise<Tables<"teams">[]> {
  const supabase = createClient()

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

/**
 * Fetch user's teams
 * Accepts a Supabase client for server-side usage
 *
 * @param supabase - Supabase client instance (server or client)
 * @param userId - User ID to fetch teams for
 * @returns Promise<Tables<"teams">[]> - Array of teams user belongs to
 */
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

/**
 * Get a single team by ID
 * Uses client-side Supabase client
 *
 * @param teamId - Team UUID
 * @returns Promise<Tables<"teams"> | null> - Team or null if not found
 */
export async function getTeam(teamId: string): Promise<Tables<"teams"> | null> {
  const supabase = createClient()
  return getTeamWithClient(supabase, teamId)
}

/**
 * Get a single team by ID
 * Accepts a Supabase client for server-side usage
 *
 * @param supabase - Supabase client instance (server or client)
 * @param teamId - Team UUID
 * @returns Promise<Tables<"teams"> | null> - Team or null if not found
 */
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

/**
 * Create a new team
 *
 * @param team - Team data to insert
 * @returns Promise<Tables<"teams">> - Created team
 */
export async function createTeam(team: TablesInsert<"teams">): Promise<Tables<"teams">> {
  const supabase = createClient()

  const { data, error } = await supabase.from("teams").insert(team).select().single()

  if (error) throw error
  return data
}

/**
 * Update a team
 *
 * @param teamId - Team UUID
 * @param updates - Partial team data to update
 * @returns Promise<Tables<"teams">> - Updated team
 */
export async function updateTeam(
  teamId: string,
  updates: TablesUpdate<"teams">
): Promise<Tables<"teams">> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", teamId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get team members
 * Uses client-side Supabase client
 *
 * @param teamId - Team UUID
 * @returns Promise<Tables<"team_members">[]> - Array of team members
 */
export async function getTeamMembers(teamId: string): Promise<Tables<"team_members">[]> {
  const supabase = createClient()
  return getTeamMembersWithClient(supabase, teamId)
}

/**
 * Get team members
 * Accepts a Supabase client for server-side usage
 *
 * @param supabase - Supabase client instance (server or client)
 * @param teamId - Team UUID
 * @returns Promise<Tables<"team_members">[]> - Array of team members
 */
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

/**
 * Get team invitations
 *
 * @param teamId - Team UUID
 * @returns Promise<Tables<"team_invitations">[]> - Array of pending invitations
 */
export async function getTeamInvitations(teamId: string): Promise<Tables<"team_invitations">[]> {
  const supabase = createClient()

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

/**
 * Accept team invitation (via RPC)
 * Uses the accept_team_invitation RPC function from the database
 *
 * @param token - Invitation token
 * @returns Promise<string> - Team ID
 */
export async function acceptTeamInvitation(token: string): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("accept_team_invitation", {
    invitation_token: token
  })

  if (error) throw error
  return data as string
}

/**
 * Change team member role (via RPC)
 * Uses the change_team_member_role RPC function from the database
 * Validates permissions and prevents invalid role changes
 *
 * @param teamId - Team UUID
 * @param userId - User UUID to change role for
 * @param newRole - New role (owner, admin, member, viewer)
 * @returns Promise<void>
 */
export async function changeTeamMemberRole(
  teamId: string,
  userId: string,
  newRole: Tables<"team_members">["role"]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.rpc("change_team_member_role", {
    target_team_id: teamId,
    target_user_id: userId,
    new_role: newRole
  })

  if (error) throw error
}

/**
 * Transfer team ownership (via RPC)
 * Uses the transfer_team_ownership RPC function from the database
 * Validates that caller is current owner and new owner is a member
 *
 * @param teamId - Team UUID
 * @param newOwnerId - User UUID of new owner
 * @returns Promise<void>
 */
export async function transferTeamOwnership(teamId: string, newOwnerId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.rpc("transfer_team_ownership", {
    target_team_id: teamId,
    new_owner_id: newOwnerId
  })

  if (error) throw error
}
