import type { getTranslations } from "@/lib/i18n/translations"

type Translations = ReturnType<typeof getTranslations>

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message
  }
  return ""
}

export function mapInvitationAcceptError(error: unknown, t: Translations): string {
  const message = extractErrorMessage(error).toLowerCase()

  if (message.includes("invitation has expired")) {
    return t.invitations.errorExpired
  }

  if (message.includes("invitation already accepted")) {
    return t.invitations.errorAlreadyAccepted
  }

  if (message.includes("invitation not found")) {
    return t.invitations.errorNotFound
  }

  if (message.includes("not authenticated")) {
    return t.invitations.signInRequiredDescription
  }

  if (message.includes("different email address")) {
    return t.invitations.signInRequiredDescription
  }

  return t.invitations.failedToAccept
}
