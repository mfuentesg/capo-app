import { render, screen } from "@testing-library/react"
import { UserProfileMenu } from "../user-profile-menu"

jest.mock("@/features/auth", () => ({
  useUser: jest.fn().mockReturnValue({ data: { displayName: "Jane", avatarUrl: null, email: "jane@test.com" } })
}))
jest.mock("@/features/app-context", () => ({
  useAppContext: jest.fn().mockReturnValue({
    context: null,
    teams: []
  }),
  useViewFilter: jest.fn().mockReturnValue({
    viewFilter: { type: "personal" },
    setViewFilter: jest.fn()
  })
}))
jest.mock("@/hooks/use-translation", () => ({
  useTranslation: jest.fn().mockReturnValue({ t: { common: { userMenu: "User menu" } } })
}))
jest.mock("@/features/settings", () => ({
  useLocale: jest.fn().mockReturnValue({
    t: {
      nav: {
        filterContext: "Filter view",
        viewAll: "All",
        personalAccount: "Personal",
        manageTeams: "Manage Teams",
        createTeam: "Create team",
        viewAllDescription: "Show all content"
      }
    }
  })
}))
jest.mock("@/components/layout/user-profile-header", () => ({
  UserProfileHeader: () => <div data-testid="profile-header" />
}))
jest.mock("@/components/layout/profile-menu-actions", () => ({
  ProfileMenuActions: () => <div data-testid="profile-actions" />
}))
jest.mock("@/lib/ui/stable-overlay-ids", () => ({
  createOverlayIds: () => ({ triggerId: "trigger", contentId: "content" })
}))

it("does not render a ContextSwitcher", () => {
  render(<UserProfileMenu />)
  expect(screen.queryByText("Filter view")).not.toBeInTheDocument()
})
