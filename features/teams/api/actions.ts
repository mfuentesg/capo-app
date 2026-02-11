"use server"

import { createClient } from "@/lib/supabase/server"
import type { TablesUpdate, TablesInsert } from "@/lib/supabase/database.types"
import {
  createTeam as createTeamApi,
  updateTeam as updateTeamApi,
  deleteTeam as deleteTeamApi,
  leaveTeam as leaveTeamApi,
  transferTeamOwnership as transferTeamOwnershipApi
} from "./teamsApi"

export async function createTeamAction(teamData: TablesInsert<"teams">): Promise<string> {
  const supabase = await createClient()
  const team = await createTeamApi(supabase, teamData)
  return team.id
}

export async function updateTeamAction(
  teamId: string,
  updates: TablesUpdate<"teams">
): Promise<void> {
  const supabase = await createClient()
  await updateTeamApi(supabase, teamId, updates)
}

export async function deleteTeamAction(teamId: string): Promise<void> {
  const supabase = await createClient()
  await deleteTeamApi(supabase, teamId)
}

export async function leaveTeamAction(teamId: string): Promise<void> {
  const supabase = await createClient()
  await leaveTeamApi(supabase, teamId)
}

export async function transferTeamOwnershipAction(
  teamId: string,
  newOwnerId: string
): Promise<void> {
  const supabase = await createClient()
  await transferTeamOwnershipApi(supabase, teamId, newOwnerId)
}
