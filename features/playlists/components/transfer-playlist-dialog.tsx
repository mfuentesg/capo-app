"use client"

import { useState } from "react"
import { useTeams } from "@/features/teams"
import { useTransferPlaylist } from "../hooks/use-playlists"
import type { Playlist } from "../types"
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

interface TransferPlaylistDialogProps {
  playlist: Playlist
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type Destination = "personal" | `team:${string}`

export function TransferPlaylistDialog({
  playlist,
  open,
  onOpenChange,
  onSuccess
}: TransferPlaylistDialogProps) {
  const { t } = useTranslation()
  const { data: teams = [] } = useTeams()
  const { mutate: transferPlaylist, isPending } = useTransferPlaylist()
  const [destination, setDestination] = useState<Destination | "">("")

  const isTeamPlaylist = !!playlist.teamId
  const availableTeams = teams.filter((team) => team.id !== playlist.teamId)
  const showPersonalOption = isTeamPlaylist
  const showTeamOptions = availableTeams.length > 0

  const destinationTeamId = destination.startsWith("team:")
    ? destination.slice(5)
    : null
  const destinationTeam = destinationTeamId
    ? teams.find((t) => t.id === destinationTeamId)
    : null

  const handleTransfer = () => {
    if (!destination) return
    const dest =
      destination === "personal"
        ? { type: "personal" as const }
        : { type: "team" as const, teamId: destination.slice(5) }

    transferPlaylist(
      { playlistId: playlist.id, destination: dest },
      {
        onSuccess: () => {
          onOpenChange(false)
          setDestination("")
          onSuccess()
        }
      }
    )
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isPending) {
      if (!nextOpen) setDestination("")
      onOpenChange(nextOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.playlistDetail.transferPlaylistTitle.replace("{name}", playlist.name)}</DialogTitle>
          <DialogDescription>{t.playlistDetail.transferPlaylistDescription}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Select value={destination} onValueChange={(v) => setDestination(v as Destination)}>
            <SelectTrigger>
              <SelectValue placeholder={t.playlistDetail.transferPlaylistSelectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {showPersonalOption && (
                <SelectItem value="personal">
                  {t.playlistDetail.transferPlaylistPersonal}
                </SelectItem>
              )}
              {showTeamOptions &&
                availableTeams.map((team) => (
                  <SelectItem key={team.id} value={`team:${team.id}`}>
                    {team.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {destination && destination !== "personal" && destinationTeam && (
            <p className="text-xs text-muted-foreground">
              {t.playlistDetail.transferPlaylistSongsNote.replace("{team}", destinationTeam.name)}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleTransfer} disabled={!destination || isPending}>
            {isPending && <Spinner className="mr-2 h-4 w-4" />}
            {t.playlistDetail.transferPlaylistConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
