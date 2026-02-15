import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  changeTeamMemberRole as changeTeamMemberRoleApi,
  createTeam as createTeamApi,
  deleteTeam as deleteTeamApi,
  deleteTeamInvitation as deleteTeamInvitationApi,
  inviteTeamMember as inviteTeamMemberApi,
  leaveTeam as leaveTeamApi,
  removeTeamMember as removeTeamMemberApi,
  transferTeamOwnership as transferTeamOwnershipApi,
  updateTeam as updateTeamApi
} from "../teamsApi"
import {
  changeTeamMemberRoleAction,
  createTeamAction,
  deleteTeamAction,
  deleteTeamInvitationAction,
  inviteTeamMemberAction,
  leaveTeamAction,
  removeTeamMemberAction,
  transferTeamOwnershipAction,
  updateTeamAction
} from "../actions"

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn()
}))

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn()
}))

jest.mock("../teamsApi", () => ({
  createTeam: jest.fn(),
  updateTeam: jest.fn(),
  deleteTeam: jest.fn(),
  leaveTeam: jest.fn(),
  transferTeamOwnership: jest.fn(),
  inviteTeamMember: jest.fn(),
  removeTeamMember: jest.fn(),
  changeTeamMemberRole: jest.fn(),
  deleteTeamInvitation: jest.fn()
}))

describe("team actions", () => {
  const mockSupabase = { id: "supabase-client" }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it("creates a team and revalidates team list route", async () => {
    ;(createTeamApi as jest.Mock).mockResolvedValue({ id: "team-1" })

    const result = await createTeamAction({
      name: "Worship Team",
      created_by: "user-1"
    })

    expect(result).toBe("team-1")
    expect(createTeamApi).toHaveBeenCalledWith(mockSupabase, {
      name: "Worship Team",
      created_by: "user-1"
    })
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/teams")
  })

  it("updates, deletes, leaves, and transfers ownership with team route revalidation", async () => {
    await updateTeamAction("team-1", { name: "Updated Team" })
    await deleteTeamAction("team-1")
    await leaveTeamAction("team-1")
    await transferTeamOwnershipAction("team-1", "user-2")

    expect(updateTeamApi).toHaveBeenCalledWith(mockSupabase, "team-1", { name: "Updated Team" })
    expect(deleteTeamApi).toHaveBeenCalledWith(mockSupabase, "team-1")
    expect(leaveTeamApi).toHaveBeenCalledWith(mockSupabase, "team-1")
    expect(transferTeamOwnershipApi).toHaveBeenCalledWith(mockSupabase, "team-1", "user-2")
    expect(revalidatePath).toHaveBeenCalledTimes(4)
    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/dashboard/teams")
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/dashboard/teams")
    expect(revalidatePath).toHaveBeenNthCalledWith(3, "/dashboard/teams")
    expect(revalidatePath).toHaveBeenNthCalledWith(4, "/dashboard/teams")
  })

  it("invites a member with explicit and default roles", async () => {
    await inviteTeamMemberAction("team-1", "admin@example.com", "admin")
    await inviteTeamMemberAction("team-1", "member@example.com")

    expect(inviteTeamMemberApi).toHaveBeenNthCalledWith(
      1,
      mockSupabase,
      "team-1",
      "admin@example.com",
      "admin"
    )
    expect(inviteTeamMemberApi).toHaveBeenNthCalledWith(
      2,
      mockSupabase,
      "team-1",
      "member@example.com",
      "member"
    )
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("removes members, changes role, and deletes invitations", async () => {
    await removeTeamMemberAction("team-1", "user-3")
    await changeTeamMemberRoleAction("team-1", "user-3", "viewer")
    await deleteTeamInvitationAction("invite-1")

    expect(removeTeamMemberApi).toHaveBeenCalledWith(mockSupabase, "team-1", "user-3")
    expect(changeTeamMemberRoleApi).toHaveBeenCalledWith(
      mockSupabase,
      "team-1",
      "user-3",
      "viewer"
    )
    expect(deleteTeamInvitationApi).toHaveBeenCalledWith(mockSupabase, "invite-1")
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
