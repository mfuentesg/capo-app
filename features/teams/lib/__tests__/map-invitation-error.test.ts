import { getTranslations } from "@/lib/i18n/translations"
import { mapInvitationAcceptError } from "../map-invitation-error"

describe("mapInvitationAcceptError", () => {
  const t = getTranslations("en")

  it("maps expired invitation errors", () => {
    expect(mapInvitationAcceptError(new Error("Invitation has expired"), t)).toBe(
      t.invitations.errorExpired
    )
  })

  it("maps already accepted invitation errors", () => {
    expect(mapInvitationAcceptError(new Error("Invitation already accepted"), t)).toBe(
      t.invitations.errorAlreadyAccepted
    )
  })

  it("maps invitation not found errors", () => {
    expect(mapInvitationAcceptError(new Error("Invitation not found"), t)).toBe(
      t.invitations.errorNotFound
    )
  })

  it("maps unauthenticated errors", () => {
    expect(mapInvitationAcceptError(new Error("Not authenticated"), t)).toBe(
      t.invitations.signInRequiredDescription
    )
  })

  it("maps email mismatch errors", () => {
    expect(mapInvitationAcceptError(new Error("Invitation is for a different email address"), t)).toBe(
      t.invitations.signInRequiredDescription
    )
  })

  it("maps missing user email errors", () => {
    expect(mapInvitationAcceptError(new Error("User email not available"), t)).toBe(
      t.invitations.signInRequiredDescription
    )
  })

  it("maps object-like errors with message", () => {
    expect(
      mapInvitationAcceptError({ message: "Invitation already accepted" }, t)
    ).toBe(t.invitations.errorAlreadyAccepted)
  })

  it("falls back to generic message for unknown errors", () => {
    expect(mapInvitationAcceptError(new Error("Unknown backend issue"), t)).toBe(
      t.invitations.failedToAccept
    )
    expect(mapInvitationAcceptError("some random string", t)).toBe(t.invitations.failedToAccept)
    expect(mapInvitationAcceptError({ code: "P0001" }, t)).toBe(t.invitations.failedToAccept)
  })
})
