"use client"

import { useState } from "react"
import { useTeams } from "@/features/teams"
import { useTransferSongToTeam } from "../hooks/use-songs"
import type { Song } from "../types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useTranslation } from "@/hooks/use-translation"

interface TransferToTeamDialogProps {
  song: Song
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TransferToTeamDialog({
  song,
  open,
  onOpenChange,
  onSuccess
}: TransferToTeamDialogProps) {
  const { t } = useTranslation()
  const { data: teams = [] } = useTeams()
  const { mutate: transferSong, isPending } = useTransferSongToTeam()
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")

  const handleTransfer = () => {
    if (!selectedTeamId) return
    transferSong(
      { songId: song.id, teamId: selectedTeamId },
      {
        onSuccess: () => {
          onOpenChange(false)
          setSelectedTeamId("")
          onSuccess()
        }
      }
    )
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isPending) {
      if (!nextOpen) setSelectedTeamId("")
      onOpenChange(nextOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.songs.transferToTeamTitle}</DialogTitle>
          <DialogDescription>
            {t.songs.transferToTeamDescription.replace("{title}", song.title)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger>
              <SelectValue placeholder={t.songs.transferToTeamSelectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t.songs.transferToTeamWarning}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleTransfer} disabled={!selectedTeamId || isPending}>
            {isPending && <Spinner className="mr-2 h-4 w-4" />}
            {t.songs.transferToTeamConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
