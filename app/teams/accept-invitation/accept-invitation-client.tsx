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
import { mapInvitationAcceptError } from "@/features/teams/lib/map-invitation-error"

type InvitationStatus = "loading" | "success" | "error" | "invalid"

export function AcceptInvitationClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const { data: user, isLoading: userLoading } = useUser()
  const acceptInvitationMutation = useAcceptTeamInvitation()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<InvitationStatus>("loading")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const acceptInvitation = async () => {
      // Wait for user data to load
      if (userLoading) {
        return
      }

      if (!token) {
        setStatus("invalid")
        setError(t.invitations.missingToken)
        return
      }

      if (!user) {
        setStatus("error")
        setError(t.invitations.signInRequiredDescription)
        return
      }

      try {
        await acceptInvitationMutation.mutateAsync({ token })
        setStatus("success")

        // Redirect to team page after 2 seconds
        setTimeout(() => {
          router.push(`/dashboard/teams`)
        }, 2000)
      } catch (err) {
        setStatus("error")
        console.error("Accept invitation error:", err)
        setError(mapInvitationAcceptError(err, t))
      }
    }

    acceptInvitation()
  }, [token, user, userLoading, router, t, acceptInvitationMutation])

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
