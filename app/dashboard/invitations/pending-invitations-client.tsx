"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/hooks/use-translation"
import { useUser } from "@/features/auth"
import { useAcceptTeamInvitation } from "@/features/teams"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle, Clock, AlertCircle } from "lucide-react"
import type { Tables } from "@/lib/supabase/database.types"
import { mapInvitationAcceptError } from "@/features/teams/lib/map-invitation-error"

interface PendingInvitation extends Tables<"team_invitations"> {
  teamName?: string
  inviterName?: string
}

async function fetchJson<T>(response: Response): Promise<T> {
  const json: unknown = await response.json()
  return json as T
}

export function PendingInvitationsClient() {
  const router = useRouter()
  const { t } = useTranslation()
  const { data: user, isLoading: userLoading } = useUser()
  const acceptInvitationMutation = useAcceptTeamInvitation()
  const [invitations, setInvitations] = useState<PendingInvitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPendingInvitations = async () => {
      if (userLoading || !user) {
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch("/api/invitations/pending", {
          headers: {
            "Content-Type": "application/json"
          }
        })

        if (!response.ok) {
          throw new Error(t.invitations.fetchFailed)
        }

        const data = await fetchJson<PendingInvitation[]>(response)
        setInvitations(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t.invitations.loadFailed
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingInvitations()
  }, [user, userLoading, t])

  const handleAcceptInvitation = async (token: string, invitationId: string) => {
    try {
      setAcceptingId(invitationId)
      await acceptInvitationMutation.mutateAsync({ token })

      setInvitations(invitations.filter((inv) => inv.id !== invitationId))
    } catch (err) {
      setError(mapInvitationAcceptError(err, t))
      setAcceptingId(null)
    }
  }

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t.invitations.pendingTitle}</h1>
          <p className="text-muted-foreground mt-2">{t.invitations.pendingDescription}</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">{error}</AlertDescription>
          </Alert>
        )}

        {invitations.length === 0 ? (
          <Card>
            <CardContent className="pt-12">
              <div className="text-center space-y-4">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium text-lg">{t.invitations.emptyTitle}</p>
                  <p className="text-sm text-muted-foreground">{t.invitations.emptyDescription}</p>
                </div>
                <Button onClick={() => router.push("/dashboard/teams")} className="mt-4">
                  {t.invitations.goToTeams}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{invitation.teamName}</CardTitle>
                      <CardDescription>
                        {t.invitations.invitationFrom.replace(
                          "{name}",
                          invitation.inviterName || ""
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {invitation.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{invitation.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {t.invitations.expires.replace(
                          "{date}",
                          new Date(invitation.expires_at).toLocaleDateString()
                        )}
                      </span>
                    </div>
                  </div>

                  {new Date(invitation.expires_at) < new Date() ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="ml-2">{t.invitations.expired}</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleAcceptInvitation(invitation.token, invitation.id)}
                        disabled={acceptingId === invitation.id}
                        className="flex-1"
                      >
                        {acceptingId === invitation.id ? (
                          <>
                            <Spinner className="h-4 w-4 mr-2" />
                            {t.invitations.accepting}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t.invitations.accept}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(`/teams/accept-invitation?token=${invitation.token}`)
                        }
                        disabled={acceptingId === invitation.id}
                        className="flex-1"
                      >
                        {t.invitations.view}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/teams")}
            className="w-full"
          >
            {t.invitations.backToTeams}
          </Button>
        </div>
      </div>
    </div>
  )
}
