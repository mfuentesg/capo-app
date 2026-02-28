import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  acceptTeamInvitation as acceptTeamInvitationApi,
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
  acceptTeamInvitationAction,
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
  acceptTeamInvitation: jest.fn(),
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
  const mockSupabase = {
    id: "supabase-client",
    auth: {
      getUser: jest.fn()
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null
    })
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

  it("accepts invitation and revalidates invitation and team routes", async () => {
    ;(acceptTeamInvitationApi as jest.Mock).mockResolvedValue("team-1")

    const result = await acceptTeamInvitationAction("invite-token")

    expect(result).toEqual({
      teamId: "team-1",
      errorCode: null,
      errorMessage: null
    })
    expect(acceptTeamInvitationApi).toHaveBeenCalledWith(mockSupabase, "invite-token")
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/invitations")
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/teams")
  })

  it("returns AUTH_REQUIRED when current user is missing", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    const result = await acceptTeamInvitationAction("invite-token")

    expect(result).toEqual({
      teamId: null,
      errorCode: "AUTH_REQUIRED",
      errorMessage: "Not authenticated"
    })
    expect(acceptTeamInvitationApi).not.toHaveBeenCalled()
  })

  it("returns AUTH_REQUIRED when auth.getUser returns an error", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "JWT expired" }
    })

    const result = await acceptTeamInvitationAction("invite-token")

    expect(result).toEqual({
      teamId: null,
      errorCode: "AUTH_REQUIRED",
      errorMessage: "Not authenticated"
    })
    expect(acceptTeamInvitationApi).not.toHaveBeenCalled()
  })

  it("returns API error code and message when invitation RPC fails", async () => {
    ;(acceptTeamInvitationApi as jest.Mock).mockRejectedValue({
      code: "P0001",
      message: "Invitation already accepted"
    })

    const result = await acceptTeamInvitationAction("invite-token")

    expect(result).toEqual({
      teamId: null,
      errorCode: "P0001",
      errorMessage: "Invitation already accepted"
    })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("returns fallback error message when invitation RPC fails without message", async () => {
    ;(acceptTeamInvitationApi as jest.Mock).mockRejectedValue({ code: "P0001" })

    const result = await acceptTeamInvitationAction("invite-token")

    expect(result).toEqual({
      teamId: null,
      errorCode: "P0001",
      errorMessage: "Failed to accept invitation"
    })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("returns string error when invitation RPC rejects with a string", async () => {
    ;(acceptTeamInvitationApi as jest.Mock).mockRejectedValue("Invitation already accepted")

    const result = await acceptTeamInvitationAction("invite-token")

    expect(result).toEqual({
      teamId: null,
      errorCode: null,
      errorMessage: "Invitation already accepted"
    })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
