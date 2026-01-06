/**
 * Teams API - Supabase REST API functions
 *
 * Pure functions for data fetching and mutations.
 * No React hooks, no side effects beyond Supabase calls.
 *
 * TODO: Implement these functions when integrating with database
 */

import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

// Use built-in type shorthands
type Team = Database["public"]["Tables"]["teams"]["Row"]
type TeamMember = Database["public"]["Tables"]["team_members"]["Row"]
type TeamInvitation = Database["public"]["Tables"]["team_invitations"]["Row"]

/**
 * Fetch user's teams
 *
 * @returns Promise<Team[]> - Array of teams user belongs to
 */
export async function getTeams(): Promise<Team[]> {
  // TODO: Implement
  // const supabase = createClient()
  //
  // const { data, error } = await supabase
  //   .from("teams")
  //   .select("*")
  //   .order("created_at", { ascending: false })
  //
  // if (error) throw error
  // return data || []

  throw new Error("Not implemented: getTeams")
}

/**
 * Get a single team by ID
 *
 * @param teamId - Team UUID
 * @returns Promise<Team | null> - Team or null if not found
 */
export async function getTeam(teamId: string): Promise<Team | null> {
  // TODO: Implement

  // const supabase = createClient()
  //
  // const { data, error } = await supabase
  //   .from("teams")
  //   .select("*")
  //   .eq("id", teamId)
  //   .single()
  //
  // if (error) {
  //   if (error.code === "PGRST116") return null
  //   throw error
  // }
  //
  // return data

  throw new Error("Not implemented: getTeam")
}

/**
 * Create a new team
 *
 * @param team - Team data to insert
 * @returns Promise<Team> - Created team
 */
export async function createTeam(
  team: Database["public"]["Tables"]["teams"]["Insert"]
): Promise<Team> {
  // TODO: Implement
  // const supabase = createClient()
  //
  // const { data, error } = await supabase
  //   .from("teams")
  //   .insert(team)
  //   .select()
  //   .single()
  //
  // if (error) throw error
  // return data

  throw new Error("Not implemented: createTeam")
}

/**
 * Update a team
 *
 * @param teamId - Team UUID
 * @param updates - Partial team data to update
 * @returns Promise<Team> - Updated team
 */
export async function updateTeam(
  teamId: string,
  updates: Database["public"]["Tables"]["teams"]["Update"]
): Promise<Team> {
  // TODO: Implement
  // const supabase = createClient()
  //
  // const { data, error } = await supabase
  //   .from("teams")
  //   .update(updates)
  //   .eq("id", teamId)
  //   .select()
  //   .single()
  //
  // if (error) throw error
  // return data

  throw new Error("Not implemented: updateTeam")
}

/**
 * Get team members
 *
 * @param teamId - Team UUID
 * @returns Promise<TeamMember[]> - Array of team members
 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  // TODO: Implement
  // const supabase = createClient()
  //
  // const { data, error } = await supabase
  //   .from("team_members")
  //   .select("*")
  //   .eq("team_id", teamId)
  //   .order("joined_at", { ascending: true })
  //
  // if (error) throw error
  // return data || []

  throw new Error("Not implemented: getTeamMembers")
}

/**
 * Get team invitations
 *
 * @param teamId - Team UUID
 * @returns Promise<TeamInvitation[]> - Array of pending invitations
 */
export async function getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
  // TODO: Implement
  // const supabase = createClient()
  //
  // const { data, error } = await supabase
  //   .from("team_invitations")
  //   .select("*")
  //   .eq("team_id", teamId)
  //   .is("accepted_at", null)
  //   .gt("expires_at", new Date().toISOString())
  //   .order("created_at", { ascending: false })
  //
  // if (error) throw error
  // return data || []

  throw new Error("Not implemented: getTeamInvitations")
}

/**
 * Accept team invitation (via RPC)
 * Uses the accept_team_invitation RPC function from the database
 *
 * @param token - Invitation token
 * @returns Promise<string> - Team ID
 */
export async function acceptTeamInvitation(token: string): Promise<string> {
  // TODO: Implement when ready
  // const supabase = createClient()
  //
  // const { data, error } = await supabase.rpc("accept_team_invitation", {
  //   invitation_token: token,
  // })
  //
  // if (error) throw error
  // return data as string

  throw new Error("Not implemented: acceptTeamInvitation")
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
  newRole: Database["public"]["Tables"]["team_members"]["Row"]["role"]
): Promise<void> {
  // TODO: Implement when ready
  // const supabase = createClient()
  //
  // const { error } = await supabase.rpc("change_team_member_role", {
  //   target_team_id: teamId,
  //   target_user_id: userId,
  //   new_role: newRole,
  // })
  //
  // if (error) throw error

  throw new Error("Not implemented: changeTeamMemberRole")
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
  // TODO: Implement when ready
  // const supabase = createClient()
  //
  // const { error } = await supabase.rpc("transfer_team_ownership", {
  //   target_team_id: teamId,
  //   new_owner_id: newOwnerId,
  // })
  //
  // if (error) throw error

  throw new Error("Not implemented: transferTeamOwnership")
}
