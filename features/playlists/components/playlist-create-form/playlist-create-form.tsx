"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, ListMusic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { cn, formatLongDate, formatDateISO } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import { useLocale } from "@/features/settings"
import type { Playlist } from "@/features/playlists/types"

interface PlaylistCreateFormProps {
  onSubmit: (playlist: Playlist) => Promise<void>
  onCancel: () => void
}

export function PlaylistCreateForm({ onSubmit, onCancel }: PlaylistCreateFormProps) {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = name.trim().length > 0 && !isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      const playlist: Playlist = {
        id: "",
        name: name.trim(),
        description: description.trim() || undefined,
        date: date ? formatDateISO(date) : undefined,
        songs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibility: "private",
      }
      await onSubmit(playlist)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <div className="shrink-0 flex items-center justify-between border-b bg-background p-4 lg:p-6">
        <div className="flex items-center gap-2">
          <ListMusic className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{t.playlists.createPlaylist}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="playlist-name">{t.playlists.playlistName}</Label>
            <Input
              id="playlist-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.playlists.playlistNamePlaceholder}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="playlist-description">
              {t.teams.descriptionOptional}
            </Label>
            <Textarea
              id="playlist-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.playlistDetail.pickDate}</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start gap-2 font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {date
                    ? formatLongDate(date, locale)
                    : t.playlistDetail.pickDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d)
                    setIsCalendarOpen(false)
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? t.common.loading : t.playlists.createPlaylist}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
