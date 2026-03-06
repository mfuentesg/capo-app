import React from "react"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useInviteTeamMember } from "../use-teams"
import { inviteTeamMemberAction } from "../../api/actions"
import { teamsKeys } from "../query-keys"
import type { Tables } from "@/lib/supabase/database.types"

// Mock dependencies
jest.mock("../../api/actions", () => ({
  inviteTeamMemberAction: jest.fn()
}))

jest.mock("@/features/auth", () => ({
  useUser: () => ({ data: { id: "user-1" } })
}))

jest.mock("@/features/settings", () => ({
  useLocale: () => ({
    t: {
      toasts: {
        invitationSent: "Invitation sent"
      }
    }
  })
}))

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() })
}))

const mockInviteAction = inviteTeamMemberAction as jest.Mock

describe("useInviteTeamMember", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it("should add a new invitation to the cache optimistically", async () => {
    const teamId = "team-1"
    const existingInvitation: Tables<"team_invitations"> = {
      id: "inv-1",
      email: "existing@example.com",
      role: "member",
      team_id: teamId,
      invited_by: "user-1",
      created_at: new Date().toISOString(),
      expires_at: new Date().toISOString(),
      accepted_at: null,
      token: "token-1"
    }

    // Pre-populate cache
    queryClient.setQueryData(teamsKeys.invitations(teamId), [existingInvitation])

    mockInviteAction.mockResolvedValue(undefined)

    const { result } = renderHook(() => useInviteTeamMember(), { wrapper })

    await act(async () => {
      result.current.mutate({
        teamId,
        email: "new@example.com",
        role: "admin"
      })
    })

    const cachedInvitations = queryClient.getQueryData<Tables<"team_invitations">[]>(
      teamsKeys.invitations(teamId)
    )

    expect(cachedInvitations).toHaveLength(2)
    expect(cachedInvitations).toContainEqual(existingInvitation)
    expect(cachedInvitations).toContainEqual(
      expect.objectContaining({
        email: "new@example.com",
        role: "admin"
      })
    )
  })

  it("should NOT wipe out existing invitations if cache is empty but we want to be safe", async () => {
    // This test checks the behavior when cache is undefined
    const teamId = "team-1"
    mockInviteAction.mockResolvedValue(undefined)

    const { result } = renderHook(() => useInviteTeamMember(), { wrapper })

    await act(async () => {
      result.current.mutate({
        teamId,
        email: "new@example.com",
        role: "admin"
      })
    })

    const cachedInvitations = queryClient.getQueryData<Tables<"team_invitations">[]>(
      teamsKeys.invitations(teamId)
    )

    expect(cachedInvitations).toHaveLength(1)
    expect(cachedInvitations![0].email).toBe("new@example.com")
  })

  it("should rollback to previous invitations if mutation fails", async () => {
    const teamId = "team-1"
    const existingInvitation: Tables<"team_invitations"> = {
      id: "inv-1",
      email: "existing@example.com",
      role: "member",
      team_id: teamId,
      invited_by: "user-1",
      created_at: new Date().toISOString(),
      expires_at: new Date().toISOString(),
      accepted_at: null,
      token: "token-1"
    }

    queryClient.setQueryData(teamsKeys.invitations(teamId), [existingInvitation])

    const error = new Error("Failed to invite")
    mockInviteAction.mockRejectedValue(error)

    const { result } = renderHook(() => useInviteTeamMember(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync({
          teamId,
          email: "new@example.com"
        })
      } catch (e) {
        // Expected
      }
    })

    const cachedInvitations = queryClient.getQueryData<Tables<"team_invitations">[]>(
      teamsKeys.invitations(teamId)
    )

    expect(cachedInvitations).toHaveLength(1)
    expect(cachedInvitations![0].email).toBe("existing@example.com")
  })
})
