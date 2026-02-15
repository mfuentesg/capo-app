"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { TablesUpdate, TablesInsert } from "@/lib/supabase/database.types"
import {
  createTeam as createTeamApi,
  updateTeam as updateTeamApi,
  deleteTeam as deleteTeamApi,
  leaveTeam as leaveTeamApi,
  transferTeamOwnership as transferTeamOwnershipApi,
  inviteTeamMember as inviteTeamMemberApi,
  removeTeamMember as removeTeamMemberApi,
  changeTeamMemberRole as changeTeamMemberRoleApi,
  deleteTeamInvitation as deleteTeamInvitationApi
} from "./teamsApi"

export async function createTeamAction(teamData: TablesInsert<"teams">): Promise<string> {
  const supabase = await createClient()
  const team = await createTeamApi(supabase, teamData)
  revalidatePath("/dashboard/teams")
  return team.id
}

export async function updateTeamAction(
  teamId: string,
  updates: TablesUpdate<"teams">
): Promise<void> {
  const supabase = await createClient()
  await updateTeamApi(supabase, teamId, updates)
  revalidatePath("/dashboard/teams")
}

export async function deleteTeamAction(teamId: string): Promise<void> {
  const supabase = await createClient()
  await deleteTeamApi(supabase, teamId)
  revalidatePath("/dashboard/teams")
}

export async function leaveTeamAction(teamId: string): Promise<void> {
  const supabase = await createClient()
  await leaveTeamApi(supabase, teamId)
  revalidatePath("/dashboard/teams")
}

export async function transferTeamOwnershipAction(
  teamId: string,
  newOwnerId: string
): Promise<void> {
  const supabase = await createClient()
  await transferTeamOwnershipApi(supabase, teamId, newOwnerId)
  revalidatePath("/dashboard/teams")
}

export async function inviteTeamMemberAction(
  teamId: string,
  email: string,
  role: "member" | "admin" | "owner" | "viewer" = "member"
): Promise<void> {
  const supabase = await createClient()
  await inviteTeamMemberApi(supabase, teamId, email, role)
}

export async function removeTeamMemberAction(teamId: string, userId: string): Promise<void> {
  const supabase = await createClient()
  await removeTeamMemberApi(supabase, teamId, userId)
}

export async function changeTeamMemberRoleAction(
  teamId: string,
  userId: string,
  newRole: "member" | "admin" | "owner" | "viewer"
): Promise<void> {
  const supabase = await createClient()
  await changeTeamMemberRoleApi(supabase, teamId, userId, newRole)
}

export async function deleteTeamInvitationAction(invitationId: string): Promise<void> {
  const supabase = await createClient()
  await deleteTeamInvitationApi(supabase, invitationId)
}
