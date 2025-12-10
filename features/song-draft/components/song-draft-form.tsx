"use client"

import { useState, useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KeySelect } from "@/features/songs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Info } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import type { Song } from "@/types"
import { useTranslation } from "@/hooks/use-translation"

const songFormSchema = z.object({
  title: z.string().min(1, "Song title is required").trim(),
  artist: z.string().min(1, "Artist name is required").trim(),
  key: z.string().min(1, "Key is required"),
  bpm: z.number().int().min(40, "BPM must be at least 40").max(300, "BPM must be at most 300")
})

type SongFormValues = z.infer<typeof songFormSchema>

interface SongDraftFormProps {
  song?: Song
  onClose: () => void
  onSave: (song: Song) => void
  onChange?: (updates: Partial<Song>) => void
}

export function SongDraftForm({ song, onClose, onSave, onChange }: SongDraftFormProps) {
  const { t } = useTranslation()
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false)

  const form = useForm<SongFormValues>({
    resolver: zodResolver(songFormSchema),
    defaultValues: {
      title: song?.title || "",
      artist: song?.artist || "",
      key: song?.key || "",
      bpm: song?.bpm || 120
    }
  })

  const {
    formState: { isDirty, isValid }
  } = form

  // Watch form changes and notify parent
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (onChange) {
        onChange({
          title: value.title || "",
          artist: value.artist || "",
          key: value.key || "",
          bpm: value.bpm || 0
        })
      }
    })
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange])

  const generateSongId = useCallback(() => {
    return `draft-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }, [])

  const onSubmit = useCallback(
    (values: SongFormValues) => {
      const songId = song?.id?.startsWith("preview-")
        ? generateSongId()
        : song?.id || generateSongId()

      const newSong: Song = {
        id: songId,
        title: values.title,
        artist: values.artist,
        key: values.key,
        bpm: values.bpm
      }

      onSave(newSong)
      form.reset()
    },
    [song?.id, onSave, generateSongId, form]
  )

  const handleCancelClick = useCallback(() => {
    if (isDirty) {
      setShowUnsavedPrompt(true)
    } else {
      onClose()
      form.reset()
    }
  }, [isDirty, onClose, form])

  const confirmClose = useCallback(() => {
    setShowUnsavedPrompt(false)
    onClose()
    form.reset()
  }, [onClose, form])

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b p-4 md:p-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-semibold">{t.songs.createSong}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t.songs.enterSongDetails}</p>
        </div>
        <button
          onClick={handleCancelClick}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.songs.songTitle}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Song title"
                          {...field}
                          className="shadow-none"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="artist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.songs.artist}</FormLabel>
                      <FormControl>
                        <Input placeholder="Artist name" {...field} className="shadow-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.songs.key}</FormLabel>
                      <FormControl>
                        <KeySelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select key"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bpm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BPM</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="120"
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          min="40"
                          max="300"
                          className="shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Alert>
                <Info />
                <AlertDescription>{t.songs.songSettingsInfo}</AlertDescription>
              </Alert>
            </div>

            {/* Unsaved changes prompt */}
            {showUnsavedPrompt && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 mt-6">
                <p className="text-sm font-medium mb-3">{t.common.unsavedChanges}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.common.discardChangesMessage}
                </p>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowUnsavedPrompt(false)}>
                    {t.common.keepEditing}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={confirmClose}>
                    {t.common.discard}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Action buttons */}
          <div className="border-t p-4 md:p-6 flex gap-3 justify-end shrink-0 bg-background">
            <Button type="button" variant="outline" onClick={handleCancelClick}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={!isValid}>
              {t.common.submit}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
