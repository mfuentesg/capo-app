import { setViewFilterCookie, getInitialAppContextData } from "../server"
import { VIEW_FILTER_KEY, SELECTED_TEAM_ID_KEY } from "../constants"
import { createClient } from "@/lib/supabase/server"
import { getUser } from "@/features/auth/api"
import { getTeamsWithClient } from "@/features/teams/api"
import { getUserPreferences } from "@/features/songs/api/user-preferences-api"
import { cookies } from "next/headers"

// Declare at module scope so they're accessible in all tests
const mockSet = jest.fn()
const mockDelete = jest.fn()
const mockGet = jest.fn()

jest.mock("next/headers", () => ({
  cookies: jest.fn()
}))

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn()
}))

jest.mock("@/features/auth/api", () => ({
  getUser: jest.fn()
}))

jest.mock("@/features/teams/api", () => ({
  getTeamsWithClient: jest.fn(),
  api: { getTeams: jest.fn() }
}))

jest.mock("@/features/songs/api/user-preferences-api", () => ({
  getUserPreferences: jest.fn()
}))

beforeEach(() => {
  jest.clearAllMocks()
  ;(cookies as jest.Mock).mockResolvedValue({ set: mockSet, delete: mockDelete, get: mockGet })
})

describe("setViewFilterCookie", () => {
  it("sets the view filter cookie to the given type", async () => {
    await setViewFilterCookie("team")

    expect(mockSet).toHaveBeenCalledWith(
      VIEW_FILTER_KEY,
      "team",
      expect.objectContaining({ path: "/", maxAge: 31536000 })
    )
  })

  it("deletes the cookie when type is 'all'", async () => {
    await setViewFilterCookie("all")

    expect(mockDelete).toHaveBeenCalledWith(VIEW_FILTER_KEY)
  })
})

describe("getInitialAppContextData", () => {
  const mockGetUser = jest.fn()

  beforeEach(() => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: mockGetUser }
    })
    ;(getUser as jest.Mock).mockResolvedValue(null)
    ;(getTeamsWithClient as jest.Mock).mockResolvedValue([])
    ;(getUserPreferences as jest.Mock).mockResolvedValue(null)
    // Default: no cookies set
    mockGet.mockReturnValue(undefined)
  })

  it("returns initialViewFilter: all when no view filter cookie is set", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getInitialAppContextData()

    expect(result.initialViewFilter).toEqual({ type: "all" })
  })

  it("returns initialViewFilter: all when view filter cookie is 'all'", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    mockGet.mockImplementation((key: string) => {
      if (key === VIEW_FILTER_KEY) return { value: "all" }
      return undefined
    })

    const result = await getInitialAppContextData()

    expect(result.initialViewFilter).toEqual({ type: "all" })
  })

  it("returns initialViewFilter: personal when view filter cookie is 'personal'", async () => {
    const authUser = { id: "user-1" }
    mockGetUser.mockResolvedValue({ data: { user: authUser } })
    ;(getUser as jest.Mock).mockResolvedValue({ id: "user-1", email: "test@example.com" })
    ;(getTeamsWithClient as jest.Mock).mockResolvedValue([])
    mockGet.mockImplementation((key: string) => {
      if (key === VIEW_FILTER_KEY) return { value: "personal" }
      return undefined
    })

    const result = await getInitialAppContextData()

    expect(result.initialViewFilter).toEqual({ type: "personal" })
  })

  it("returns initialViewFilter: team when view filter cookie is 'team' and a team is selected", async () => {
    const authUser = { id: "user-1" }
    mockGetUser.mockResolvedValue({ data: { user: authUser } })
    ;(getUser as jest.Mock).mockResolvedValue({ id: "user-1", email: "test@example.com" })
    ;(getTeamsWithClient as jest.Mock).mockResolvedValue([{ id: "team-42" }])
    mockGet.mockImplementation((key: string) => {
      if (key === VIEW_FILTER_KEY) return { value: "team" }
      if (key === SELECTED_TEAM_ID_KEY) return { value: "team-42" }
      return undefined
    })

    const result = await getInitialAppContextData()

    expect(result.initialViewFilter).toEqual({ type: "team", teamId: "team-42" })
  })

  it("resets to initialViewFilter: all when view filter cookie is 'team' but no team is selected", async () => {
    const authUser = { id: "user-1" }
    mockGetUser.mockResolvedValue({ data: { user: authUser } })
    ;(getUser as jest.Mock).mockResolvedValue({ id: "user-1", email: "test@example.com" })
    ;(getTeamsWithClient as jest.Mock).mockResolvedValue([])
    mockGet.mockImplementation((key: string) => {
      if (key === VIEW_FILTER_KEY) return { value: "team" }
      return undefined
    })

    const result = await getInitialAppContextData()

    expect(result.initialViewFilter).toEqual({ type: "all" })
    expect(mockDelete).toHaveBeenCalledWith(VIEW_FILTER_KEY)
  })
})
