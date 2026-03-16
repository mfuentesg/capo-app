"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users as UsersIcon, Wrench, LogOut, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLeaveTeam, useDeleteTeam, useUpdateTeam } from "@/features/teams"
import { useAppContext } from "@/features/app-context"
import { useUser } from "@/features/auth"
import { useTranslation } from "@/hooks/use-translation"
import type { TeamWithMemberCount } from "@/features/teams"
import { TeamIcon, IconPicker } from "@/components/ui/icon-picker"
import { RoleBadge } from "./role-badge"

interface TeamCardProps {
  team: TeamWithMemberCount
  memberCount?: number
}

export function TeamCard({ team, memberCount = 1 }: TeamCardProps) {
  const { context, switchToPersonal } = useAppContext()
  const { data: user } = useUser()
  const { t } = useTranslation()
  const router = useRouter()
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingIcon, setEditingIcon] = useState(team.icon || "")

  const onTeamActionSuccess = (teamId: string) => {
    if (context?.type === "team" && context.teamId === teamId) {
      switchToPersonal()
    }
  }

  const leaveTeamMutation = useLeaveTeam({ onSuccess: onTeamActionSuccess })
  const deleteTeamMutation = useDeleteTeam({ onSuccess: onTeamActionSuccess })
  const updateTeamMutation = useUpdateTeam()

  const isOwner = user?.id === team.created_by
  const isOnlyMember = memberCount <= 1

  const handleIconChange = (newIcon: string) => {
    setEditingIcon(newIcon)
    updateTeamMutation.mutate({ teamId: team.id, updates: { icon: newIcon } })
  }

  const handleLeaveOrDelete = () => {
    if (isOwner) {
      if (isOnlyMember) {
        // Owner is alone - show delete dialog
        setIsDeleteDialogOpen(true)
      } else {
        // Owner has other members - redirect to team detail for transfer
        router.push(`/dashboard/teams/${team.id}`)
      }
    } else {
      // Non-owner can leave directly
      setIsLeaveDialogOpen(true)
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {isOwner ? (
                <IconPicker
                  value={editingIcon}
                  onChange={handleIconChange}
                  iconClassName="h-5 w-5"
                  idBase={`team-card-${team.id}-icon-picker`}
                />
              ) : (
                <Avatar className="h-10 w-10 border border-border">
                  {team.avatar_url && <AvatarImage src={team.avatar_url} alt={team.name} />}
                  <AvatarFallback className="bg-primary/10">
                    <TeamIcon icon={editingIcon} className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/dashboard/teams/${team.id}`}>
                  <CardTitle className="text-lg truncate hover:underline cursor-pointer">
                    {team.name}
                  </CardTitle>
                </Link>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <UsersIcon className="h-4 w-4" />
                <span>
                  {memberCount} {t.teams.members}
                </span>
              </div>
              {team.role && <RoleBadge role={team.role} className="text-[10px]" />}
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
                onClick={handleLeaveOrDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                title={isOwner && isOnlyMember ? t.teams.deleteTeam : t.teams.leaveTeam}
              >
                {isOwner && isOnlyMember ? (
                  <Trash2 className="h-4 w-4" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                title={`${t.teams.manageTeam}: ${team.name}`}
              >
                <Link
                  href={`/dashboard/teams/${team.id}`}
                  aria-label={`${t.teams.manageTeam}: ${team.name}`}
                >
                  <Wrench className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Team Dialog (for non-owners) */}
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
              onClick={() =>
                leaveTeamMutation.mutate(team.id, {
                  onSuccess: () => setIsLeaveDialogOpen(false)
                })
              }
              disabled={leaveTeamMutation.isPending}
            >
              {leaveTeamMutation.isPending ? t.teams.leaving : t.teams.leaveTeam}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog (for owners with no other members) */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.teams.deleteTeamConfirmTitle}</DialogTitle>
            <DialogDescription>
              {t.teams.deleteTeamConfirmDescription.replace("{name}", team.name)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteTeamMutation.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                deleteTeamMutation.mutate(team.id, {
                  onSuccess: () => setIsDeleteDialogOpen(false)
                })
              }
              disabled={deleteTeamMutation.isPending}
            >
              {t.teams.deleteTeam}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
