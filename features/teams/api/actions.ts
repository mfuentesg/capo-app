"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { TablesUpdate, TablesInsert } from "@/lib/supabase/database.types"
import {
  createTeam as createTeamApi,
  updateTeam as updateTeamApi,
  deleteTeam as deleteTeamApi,
  leaveTeam as leaveTeamApi,
  acceptTeamInvitation as acceptTeamInvitationApi,
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

export interface AcceptTeamInvitationResult {
  teamId: string | null
  errorCode: string | null
  errorMessage: string | null
}

export async function acceptTeamInvitationAction(token: string): Promise<AcceptTeamInvitationResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      teamId: null,
      errorCode: "AUTH_REQUIRED",
      errorMessage: "Not authenticated"
    }
  }

  try {
    const teamId = await acceptTeamInvitationApi(supabase, token)
    revalidatePath("/dashboard/invitations")
    revalidatePath("/dashboard/teams")
    return {
      teamId,
      errorCode: null,
      errorMessage: null
    }
  } catch (err) {
    const errorCode =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      typeof (err as { code?: unknown }).code === "string"
        ? (err as { code: string }).code
        : null

    const errorMessage =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : typeof err === "object" &&
              err !== null &&
              "message" in err &&
              typeof (err as { message?: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Failed to accept invitation"

    return {
      teamId: null,
      errorCode,
      errorMessage
    }
  }
}
