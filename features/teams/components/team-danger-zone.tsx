"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { LogOut, Trash2 } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import type { Tables } from "@/lib/supabase/database.types"

type TeamMemberWithName = Tables<"team_members"> & { user_full_name: string | null }

interface TeamDangerZoneProps {
  teamName: string
  members: TeamMemberWithName[]
  currentUserId: string
  onDelete: () => void
  onTransferAndLeave: (newOwnerId: string) => void
  isDeleting?: boolean
  isTransferring?: boolean
}

export function TeamDangerZone({
  teamName,
  members,
  currentUserId,
  onDelete,
  onTransferAndLeave,
  isDeleting,
  isTransferring
}: TeamDangerZoneProps) {
  const { t } = useTranslation()
  const [selectedNewOwner, setSelectedNewOwner] = useState<string>("")

  // Get other members (excluding current user)
  const otherMembers = members.filter((m) => m.user_id !== currentUserId)
  const hasOtherMembers = otherMembers.length > 0

  const handleTransferAndLeave = () => {
    if (selectedNewOwner) {
      onTransferAndLeave(selectedNewOwner)
    }
  }

  return (
    <div className="rounded-lg border border-destructive/50 bg-card p-6">
      <h2 className="text-lg font-semibold text-destructive mb-4">{t.account.dangerZone}</h2>
      <div className="space-y-4">
        {hasOtherMembers ? (
          // Owner with other members: show transfer & leave option
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t.teams.leaveTeam}</p>
              <p className="text-xs text-muted-foreground">{t.teams.leaveAsOwner}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isTransferring}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t.teams.leaveTeam}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.teams.transferOwnership}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.teams.transferOwnershipDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium mb-2 block">{t.teams.selectNewOwner}</label>
                  <Select value={selectedNewOwner} onValueChange={setSelectedNewOwner}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.teams.selectNewOwner} />
                    </SelectTrigger>
                    <SelectContent>
                      {otherMembers.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {member.user_full_name || member.user_id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleTransferAndLeave}
                    disabled={!selectedNewOwner || isTransferring}
                  >
                    {isTransferring ? t.teams.leaving : t.teams.transferAndLeave}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          // Owner with no other members: show delete option
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t.teams.deleteTeam}</p>
              <p className="text-xs text-muted-foreground">{t.teams.deleteTeamDescription}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t.teams.deleteTeam}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.teams.deleteTeamConfirmTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.teams.deleteTeamConfirmDescription.replace("{name}", teamName)}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={onDelete}>
                    {t.teams.deleteTeam}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  )
}
