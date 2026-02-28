/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react"
import { AcceptInvitationClient } from "../accept-invitation-client"
import { useUser } from "@/features/auth"
import { useAcceptTeamInvitation, mapInvitationAcceptError } from "@/features/teams"

// ─── Navigation mocks ────────────────────────────────────────────────────────

const mockRouterPush = jest.fn()
const mockGetSearchParam = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: mockRouterPush })),
  useSearchParams: jest.fn(() => ({ get: mockGetSearchParam }))
}))

// ─── Feature mocks ────────────────────────────────────────────────────────────

jest.mock("@/features/auth", () => ({
  useUser: jest.fn()
}))

jest.mock("@/features/teams", () => ({
  useAcceptTeamInvitation: jest.fn(),
  mapInvitationAcceptError: jest.fn()
}))

jest.mock("@/hooks/use-translation", () => ({
  useTranslation: jest.fn(() => ({
    t: {
      invitations: {
        title: "Team Invitation",
        processing: "Processing your invitation...",
        welcome: "Welcome to the team!",
        unableToAccept: "Unable to accept invitation",
        invalid: "Invalid invitation",
        acceptingDescription: "Accepting your invitation...",
        acceptedTitle: "Invitation accepted successfully!",
        redirecting: "Redirecting you to your teams...",
        failedToAccept: "Failed to accept invitation",
        invalidLinkTitle: "Invalid invitation link",
        invalidLinkDescription: "This invitation link is invalid or has already been used.",
        signIn: "Sign In",
        goToTeams: "Go to Teams",
        goToDashboard: "Go to Dashboard",
        missingToken: "No invitation token provided",
        signInRequiredDescription:
          "You need to be signed in with the email address that matches this invitation."
      }
    }
  }))
}))

// ─── Typed mock helpers ───────────────────────────────────────────────────────

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>
const mockUseAcceptTeamInvitation = useAcceptTeamInvitation as jest.MockedFunction<
  typeof useAcceptTeamInvitation
>
const mockMapInvitationAcceptError = mapInvitationAcceptError as jest.MockedFunction<
  typeof mapInvitationAcceptError
>

function makeAcceptMutation(mutateAsync: jest.Mock = jest.fn()) {
  return { mutateAsync } as any
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe("AcceptInvitationClient", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
    mockGetSearchParam.mockReturnValue("test-token")
    mockUseUser.mockReturnValue({ data: { id: "user-1", email: "user@example.com" }, isLoading: false } as any)
    mockUseAcceptTeamInvitation.mockReturnValue(makeAcceptMutation())
    mockMapInvitationAcceptError.mockReturnValue("Failed to accept invitation")
  })

  // ── Loading state ──────────────────────────────────────────────────────────

  it("shows loading spinner while user data is loading", () => {
    mockUseUser.mockReturnValue({ data: undefined, isLoading: true } as any)

    render(<AcceptInvitationClient />)

    expect(screen.getByText("Processing your invitation...")).toBeInTheDocument()
    expect(screen.getByText("Accepting your invitation...")).toBeInTheDocument()
  })

  it("does not call mutateAsync while user data is loading", () => {
    const mutateAsync = jest.fn()
    mockUseAcceptTeamInvitation.mockReturnValue(makeAcceptMutation(mutateAsync))
    mockUseUser.mockReturnValue({ data: undefined, isLoading: true } as any)

    render(<AcceptInvitationClient />)

    expect(mutateAsync).not.toHaveBeenCalled()
  })

  // ── Invalid token ──────────────────────────────────────────────────────────

  it("shows invalid state when token is missing from URL", async () => {
    mockGetSearchParam.mockReturnValue(null)
    mockUseUser.mockReturnValue({ data: undefined, isLoading: false } as any)

    render(<AcceptInvitationClient />)

    await waitFor(() => {
      expect(screen.getByText("Invalid invitation")).toBeInTheDocument()
      expect(screen.getByText("Invalid invitation link")).toBeInTheDocument()
    })
  })

  // ── Unauthenticated user ───────────────────────────────────────────────────

  it("shows sign-in button and auth message when user is not authenticated", async () => {
    mockUseUser.mockReturnValue({ data: undefined, isLoading: false } as any)

    render(<AcceptInvitationClient />)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument()
      expect(
        screen.getByText(
          "You need to be signed in with the email address that matches this invitation."
        )
      ).toBeInTheDocument()
    })

    expect(screen.queryByRole("button", { name: "Go to Teams" })).not.toBeInTheDocument()
  })

  it("sets invitation cookie and navigates to root when sign-in button is clicked", async () => {
    mockUseUser.mockReturnValue({ data: undefined, isLoading: false } as any)

    render(<AcceptInvitationClient />)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

    expect(document.cookie).toContain("_invitation_token=test-token")
    expect(mockRouterPush).toHaveBeenCalledWith("/")
  })

  // ── Successful acceptance ──────────────────────────────────────────────────

  it("shows success state after invitation is accepted", async () => {
    const mutateAsync = jest.fn().mockResolvedValue("team-1")
    mockUseAcceptTeamInvitation.mockReturnValue(makeAcceptMutation(mutateAsync))

    render(<AcceptInvitationClient />)

    await waitFor(() => {
      expect(screen.getByText("Welcome to the team!")).toBeInTheDocument()
      expect(screen.getByText("Invitation accepted successfully!")).toBeInTheDocument()
    })

    expect(mutateAsync).toHaveBeenCalledWith({ token: "test-token" })
  })

  it("redirects to /dashboard/teams 2 seconds after successful acceptance", async () => {
    jest.useFakeTimers()
    const mutateAsync = jest.fn().mockResolvedValue("team-1")
    mockUseAcceptTeamInvitation.mockReturnValue(makeAcceptMutation(mutateAsync))

    render(<AcceptInvitationClient />)

    await waitFor(() => {
      expect(screen.getByText("Invitation accepted successfully!")).toBeInTheDocument()
    })

    expect(mockRouterPush).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(mockRouterPush).toHaveBeenCalledWith("/dashboard/teams")
  })

  it("does not re-call mutateAsync after success (status guard)", async () => {
    const mutateAsync = jest.fn().mockResolvedValue("team-1")
    mockUseAcceptTeamInvitation.mockReturnValue(makeAcceptMutation(mutateAsync))

    render(<AcceptInvitationClient />)

    await waitFor(() => {
      expect(screen.getByText("Invitation accepted successfully!")).toBeInTheDocument()
    })

    // Status is now "success" — effect should not re-run the acceptance
    expect(mutateAsync).toHaveBeenCalledTimes(1)
  })

  // ── Error states ───────────────────────────────────────────────────────────

  it("shows error state with Go to Teams button for expired invitation", async () => {
    const mutateAsync = jest.fn().mockRejectedValue(new Error("Invitation has expired"))
    mockUseAcceptTeamInvitation.mockReturnValue(makeAcceptMutation(mutateAsync))
    mockMapInvitationAcceptError.mockReturnValue(
      "This invitation has expired. Ask the team admin to send you a new invitation."
    )

    render(<AcceptInvitationClient />)

    await waitFor(() => {
      expect(screen.getByText("Unable to accept invitation")).toBeInTheDocument()
      expect(
        screen.getByText(
          "This invitation has expired. Ask the team admin to send you a new invitation."
        )
      ).toBeInTheDocument()
    })

    expect(screen.getByRole("button", { name: "Go to Teams" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument()
  })

  it("shows error state with Go to Teams button for already accepted invitation", async () => {
    const mutateAsync = jest.fn().mockRejectedValue(new Error("Invitation already accepted"))
    mockUseAcceptTeamInvitation.mockReturnValue(makeAcceptMutation(mutateAsync))
    mockMapInvitationAcceptError.mockReturnValue(
      "This invitation was already accepted. You can access the team from your Teams page."
    )

    render(<AcceptInvitationClient />)

    await waitFor(() => {
      expect(
        screen.getByText(
          "This invitation was already accepted. You can access the team from your Teams page."
        )
      ).toBeInTheDocument()
    })

    expect(screen.getByRole("button", { name: "Go to Teams" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument()
  })

  it("shows error state with Go to Teams button for not found invitation", async () => {
    const mutateAsync = jest.fn().mockRejectedValue(new Error("Invitation not found"))
    mockUseAcceptTeamInvitation.mockReturnValue(makeAcceptMutation(mutateAsync))
    mockMapInvitationAcceptError.mockReturnValue(
      "This invitation link is invalid or no longer available."
    )

    render(<AcceptInvitationClient />)

    await waitFor(() => {
      expect(
        screen.getByText("This invitation link is invalid or no longer available.")
      ).toBeInTheDocument()
    })

    expect(screen.getByRole("button", { name: "Go to Teams" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument()
  })

  // ── Auth-related API errors ────────────────────────────────────────────────

  it("shows sign-in button when invitation is for a different email address", async () => {
    const mutateAsync = jest
      .fn()
      .mockRejectedValue(new Error("Invitation is for a different email address"))
    mockUseAcceptTeamInvitation.mockReturnValue(makeAcceptMutation(mutateAsync))
    mockMapInvitationAcceptError.mockReturnValue(
      "You need to be signed in with the email address that matches this invitation."
    )

    render(<AcceptInvitationClient />)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument()
    })

    expect(screen.queryByRole("button", { name: "Go to Teams" })).not.toBeInTheDocument()
  })

  it("shows sign-in button when user email is not available", async () => {
    const mutateAsync = jest
      .fn()
      .mockRejectedValue(new Error("User email not available"))
    mockUseAcceptTeamInvitation.mockReturnValue(makeAcceptMutation(mutateAsync))
    mockMapInvitationAcceptError.mockReturnValue(
      "You need to be signed in with the email address that matches this invitation."
    )

    render(<AcceptInvitationClient />)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument()
    })
  })

  it("sign-in button after API auth error sets cookie and navigates to root", async () => {
    const mutateAsync = jest
      .fn()
      .mockRejectedValue(new Error("Invitation is for a different email address"))
    mockUseAcceptTeamInvitation.mockReturnValue(makeAcceptMutation(mutateAsync))
    mockMapInvitationAcceptError.mockReturnValue(
      "You need to be signed in with the email address that matches this invitation."
    )

    render(<AcceptInvitationClient />)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

    expect(document.cookie).toContain("_invitation_token=test-token")
    expect(mockRouterPush).toHaveBeenCalledWith("/")
  })

  // ── Go to Dashboard button ─────────────────────────────────────────────────

  it("always shows Go to Dashboard button in error states", async () => {
    const mutateAsync = jest.fn().mockRejectedValue(new Error("Something went wrong"))
    mockUseAcceptTeamInvitation.mockReturnValue(makeAcceptMutation(mutateAsync))

    render(<AcceptInvitationClient />)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Go to Dashboard" })).toBeInTheDocument()
    })
  })
})
