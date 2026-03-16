import { render, screen } from "@testing-library/react"
import { ContextPill } from "../context-pill"
import { useViewFilter } from "@/features/app-context"

jest.mock("@/features/app-context", () => ({
  useViewFilter: jest.fn().mockReturnValue({
    viewFilter: { type: "all" },
    setViewFilter: jest.fn()
  }),
  useAppContext: jest.fn().mockReturnValue({
    teams: [{ id: "t1", name: "Worship Team", icon: null, avatar_url: null }]
  })
}))
jest.mock("@/features/auth", () => ({
  useUser: jest.fn().mockReturnValue({ data: { displayName: "Jane", avatarUrl: null } })
}))
jest.mock("@/features/settings", () => ({
  useLocale: jest.fn().mockReturnValue({
    t: {
      nav: {
        viewAll: "All",
        filterContext: "Filter view",
        personalAccount: "Personal",
        manageTeams: "Manage Teams",
        viewAllDescription: "Show all content"
      }
    }
  })
}))

const mockUseViewFilter = jest.mocked(useViewFilter)

it("shows 'All' label when viewFilter is all", () => {
  render(<ContextPill />)
  expect(screen.getByText("All")).toBeInTheDocument()
})

it("shows team name when viewFilter is team", () => {
  mockUseViewFilter.mockReturnValue({
    viewFilter: { type: "team", teamId: "t1" },
    setViewFilter: jest.fn()
  })
  render(<ContextPill />)
  expect(screen.getByText("Worship Team")).toBeInTheDocument()
})
