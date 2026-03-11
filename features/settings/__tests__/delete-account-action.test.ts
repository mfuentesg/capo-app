import { createClient } from "@/lib/supabase/server"
import { deleteAccountAction } from "../api/actions"
import { redirect } from "next/navigation"

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn()
}))

jest.mock("next/navigation", () => ({
  redirect: jest.fn()
}))

describe("deleteAccountAction", () => {
  const mockGetUser = jest.fn()
  const mockRpc = jest.fn()
  const mockSignOut = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: mockGetUser, signOut: mockSignOut },
      rpc: mockRpc
    })
  })

  it("throws when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    await expect(deleteAccountAction()).rejects.toThrow("Not authenticated")
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it("calls delete_user_account RPC, signs out, and redirects on success", async () => {
    const user = { id: "user-123" }
    mockGetUser.mockResolvedValue({ data: { user } })
    mockRpc.mockResolvedValue({ error: null })
    mockSignOut.mockResolvedValue({ error: null })

    await deleteAccountAction()

    expect(mockRpc).toHaveBeenCalledWith("delete_user_account", { p_user_id: "user-123" })
    expect(mockSignOut).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith("/login")
  })

  it("throws when RPC returns an error", async () => {
    const user = { id: "user-abc" }
    const rpcError = new Error("DB error")
    mockGetUser.mockResolvedValue({ data: { user } })
    mockRpc.mockResolvedValue({ error: rpcError })

    await expect(deleteAccountAction()).rejects.toThrow("DB error")
    expect(mockSignOut).not.toHaveBeenCalled()
  })
})
