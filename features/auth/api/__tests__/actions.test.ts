import { createClient } from "@/lib/supabase/server"
import { signOutAction } from "../actions"

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn()
}))

describe("signOutAction", () => {
  const mockSignOut = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue({ auth: { signOut: mockSignOut } })
  })

  it("calls supabase signOut and resolves without error", async () => {
    mockSignOut.mockResolvedValue({ error: null })
    await expect(signOutAction()).resolves.toBeUndefined()
    expect(mockSignOut).toHaveBeenCalled()
  })

  it("throws when signOut returns an error", async () => {
    const authError = new Error("Sign out failed")
    mockSignOut.mockResolvedValue({ error: authError })
    await expect(signOutAction()).rejects.toThrow("Sign out failed")
  })
})
