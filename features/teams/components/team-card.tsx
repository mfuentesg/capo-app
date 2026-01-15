"use client"

import Link from "next/link"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users as UsersIcon, Wrench, LogOut, ArrowLeftRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { teamsKeys } from "@/features/teams"
import { useAppContext } from "@/features/app-context"
import { toast } from "sonner"
import { useTranslation } from "@/hooks/use-translation"
import type { Tables } from "@/lib/supabase/database.types"
import { TeamIcon } from "@/components/ui/icon-picker"

interface TeamCardProps {
  team: Tables<"teams">
  initialSelectedTeamId?: string | null
}

export function TeamCard({ team, initialSelectedTeamId = null }: TeamCardProps) {
  const queryClient = useQueryClient()
  const { context, switchToTeam, refreshTeams } = useAppContext()
  const { t } = useTranslation()
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)

  const isCurrentTeam = context
    ? context.type === "team" && context.teamId === team.id
    : initialSelectedTeamId === team.id

  const leaveTeamMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- teamId will be used when implementing the functionality
    mutationFn: async (teamId: string) => {
      // TODO: Implement leave team functionality via backend API
      // This would require a server action or API route
      throw new Error("Leave team functionality not yet implemented")
    },
    onSuccess: async () => {
      await refreshTeams()
      queryClient.invalidateQueries({ queryKey: teamsKeys.list() })
      setIsLeaveDialogOpen(false)
      toast.success(t.toasts.teamLeft)
    },
    onError: (error: unknown) => {
      console.error("Error leaving team:", error)
      const errorMessage = error instanceof Error ? error.message : t.toasts.teamLeftFailed
      toast.error(errorMessage)
    }
  })

  return (
    <>
      <Card
        className={`hover:shadow-md transition-shadow ${isCurrentTeam ? "border-primary border-2" : ""}`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10">
                {team.avatar_url && <AvatarImage src={team.avatar_url} alt={team.name} />}
                <AvatarFallback className="bg-primary/10">
                  <TeamIcon icon={team.icon} className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{team.name}</CardTitle>
                {team.description && (
                  <CardDescription className="truncate">{team.description}</CardDescription>
                )}
              </div>
            </div>
            {isCurrentTeam ? (
              <Badge variant="default" className="ml-2 shrink-0">
                Active
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  switchToTeam(team.id)
                  toast.success(t.toasts.teamSwitched.replace("{name}", team.name))
                }}
                className="ml-2 shrink-0"
                aria-label={`${t.teams.switchToTeam}: ${team.name}`}
                title={`${t.teams.switchToTeam}: ${team.name}`}
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <UsersIcon className="h-4 w-4" />
                <span>{t.teams.members}</span>
              </div>
              {team.is_public && (
                <Badge variant="secondary" className="text-xs">
                  Public
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLeaveDialogOpen(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/teams/${team.id}`}>
                  <Wrench className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.teams.leaveTeam}</DialogTitle>
            <DialogDescription>
              {t.teams.leaveTeamConfirm.replace("{name}", team.name)}
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription>{t.teams.leaveTeamWarning}</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLeaveDialogOpen(false)}
              disabled={leaveTeamMutation.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => leaveTeamMutation.mutate(team.id)}
              disabled={leaveTeamMutation.isPending}
            >
              {leaveTeamMutation.isPending ? t.teams.leaving : t.teams.leaveTeam}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
