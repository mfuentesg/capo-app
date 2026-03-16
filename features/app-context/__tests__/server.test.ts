import { setViewFilterCookie } from "../server"

// Declare at module scope so they're accessible in all tests
const mockSet = jest.fn()
const mockDelete = jest.fn()

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    set: mockSet,
    delete: mockDelete,
    get: jest.fn()
  })
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe("setViewFilterCookie", () => {
  it("sets the view filter cookie to the given type", async () => {
    await setViewFilterCookie("team")

    expect(mockSet).toHaveBeenCalledWith(
      "capo_view_filter",
      "team",
      expect.objectContaining({ path: "/", maxAge: 31536000 })
    )
  })

  it("deletes the cookie when type is 'all'", async () => {
    await setViewFilterCookie("all")

    expect(mockDelete).toHaveBeenCalledWith("capo_view_filter")
  })
})
