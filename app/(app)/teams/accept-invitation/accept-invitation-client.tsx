"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@/features/auth"
import { useAcceptTeamInvitation } from "@/features/teams"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { mapInvitationAcceptError } from "@/features/teams"

type InvitationStatus = "loading" | "success" | "error" | "invalid"

const AUTH_ERROR_MESSAGES = ["not authenticated", "different email address", "user email not available"]

function isAuthRelatedError(message: string): boolean {
  const lower = message.toLowerCase()
  return AUTH_ERROR_MESSAGES.some((m) => lower.includes(m))
}

export function AcceptInvitationClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const { data: user, isLoading: userLoading } = useUser()
  const { mutateAsync: acceptInvitation } = useAcceptTeamInvitation()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<InvitationStatus>("loading")
  const [error, setError] = useState<string>("")
  const [isAuthError, setIsAuthError] = useState(false)

  useEffect(() => {
    if (status !== "loading") return

    const doAccept = async () => {
      if (userLoading) return

      if (!token) {
        setStatus("invalid")
        setError(t.invitations.missingToken)
        return
      }

      if (!user) {
        setStatus("error")
        setIsAuthError(true)
        setError(t.invitations.signInRequiredDescription)
        return
      }

      try {
        await acceptInvitation({ token })
        setStatus("success")

        // Redirect to team page after 2 seconds
        setTimeout(() => {
          router.push(`/dashboard/teams`)
        }, 2000)
      } catch (err) {
        const rawMessage = err instanceof Error ? err.message : ""
        setStatus("error")
        setIsAuthError(isAuthRelatedError(rawMessage))
        console.error("Accept invitation error:", err)
        setError(mapInvitationAcceptError(err, t))
      }
    }

    doAccept()
  }, [token, user, userLoading, router, t, acceptInvitation, status])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t.invitations.title}</CardTitle>
          <CardDescription>
            {status === "loading" && t.invitations.processing}
            {status === "success" && t.invitations.welcome}
            {status === "error" && t.invitations.unableToAccept}
            {status === "invalid" && t.invitations.invalid}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Spinner className="h-8 w-8" />
              <p className="text-sm text-muted-foreground">{t.invitations.acceptingDescription}</p>
            </div>
          )}

          {status === "success" && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="ml-2">
                <div className="space-y-2">
                  <p className="font-medium">{t.invitations.acceptedTitle}</p>
                  <p className="text-sm text-muted-foreground">{t.invitations.redirecting}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  <div className="space-y-2">
                    <p className="font-medium">{t.invitations.failedToAccept}</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2">
                {isAuthError ? (
                  <Button
                    onClick={() => {
                      // Store the token in a cookie so the auth callback can
                      // redirect back to this invitation page after sign-in.
                      if (token) {
                        document.cookie = `_invitation_token=${token}; path=/; max-age=3600; SameSite=Lax`
                      }
                      router.push("/")
                    }}
                    className="w-full"
                  >
                    {t.invitations.signIn}
                  </Button>
                ) : (
                  <Button onClick={() => router.push("/dashboard/teams")} className="w-full">
                    {t.invitations.goToTeams}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                >
                  {t.invitations.goToDashboard}
                </Button>
              </div>
            </div>
          )}

          {status === "invalid" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  <div className="space-y-2">
                    <p className="font-medium">{t.invitations.invalidLinkTitle}</p>
                    <p className="text-sm">{t.invitations.invalidLinkDescription}</p>
                  </div>
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push("/dashboard/teams")} className="w-full">
                  {t.invitations.goToTeams}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                >
                  {t.invitations.goToDashboard}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
