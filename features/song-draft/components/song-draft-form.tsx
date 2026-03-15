"use client"

import { useCallback, useEffect } from "react"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KeySelect } from "@/features/songs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Info } from "lucide-react"
import { SaveStatus } from "@/components/ui/save-status"
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

type SongFormValues = {
  title: string
  artist: string
  key: string
  bpm: number
}

interface SongDraftFormProps {
  song?: Song
  onClose: () => void
  onSave: (song: Song) => void
  onAutoSave?: (song: Song) => Promise<void>
  onChange?: (updates: Partial<Song>) => void
  autoFocus?: boolean
}

export function SongDraftForm({
  song,
  onClose,
  onSave,
  onAutoSave,
  onChange,
  autoFocus = false
}: SongDraftFormProps) {
  const { t } = useTranslation()

  const songFormSchema = z.object({
    title: z
      .string()
      .min(1, t.validation.required.replace("{field}", t.validation.songTitle))
      .trim(),
    artist: z
      .string()
      .min(1, t.validation.required.replace("{field}", t.validation.artistName))
      .trim(),
    key: z.string().min(1, t.validation.required.replace("{field}", t.validation.key)),
    bpm: z
      .number()
      .int()
      .min(40, t.validation.minBpm.replace("{min}", "40"))
      .max(300, t.validation.maxBpm.replace("{max}", "300"))
  })

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

  const watchedValues = form.watch()
  // Stable string for useAutoSave comparison — avoids resetting debounce on every render
  const watchedValuesKey = JSON.stringify(watchedValues)

  // Notify parent of field changes for live preview
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
    return crypto.randomUUID()
  }, [])

  const buildSong = useCallback(
    (values: SongFormValues): Song => ({
      id: song?.id?.startsWith("preview-") ? generateSongId() : song?.id || generateSongId(),
      title: values.title,
      artist: values.artist,
      key: values.key,
      bpm: values.bpm
    }),
    [song?.id, generateSongId]
  )

  const { status: saveStatus } = useAutoSave(
    watchedValuesKey,
    async (valuesJson) => {
      if (onAutoSave) {
        await onAutoSave(buildSong(JSON.parse(valuesJson) as SongFormValues))
      }
    },
    { enabled: isValid && isDirty && !!onAutoSave }
  )

  const onSubmit = useCallback(
    (values: SongFormValues) => {
      onSave(buildSong(values))
      form.reset()
    },
    [onSave, buildSong, form]
  )

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b p-4 md:p-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-semibold">{t.songs.createSong}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t.songs.enterSongDetails}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SaveStatus status={saveStatus} />
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={t.common.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
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
                          placeholder={t.songs.songTitlePlaceholder}
                          {...field}
                          className="shadow-none"
                          autoFocus={autoFocus}
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
                        <Input
                          placeholder={t.songs.artistPlaceholder}
                          {...field}
                          className="shadow-none"
                        />
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
                          placeholder={t.songs.selectKey}
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
                      <FormLabel>{t.songs.bpm}</FormLabel>
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
          </div>

          {/* Footer - Action buttons */}
          <div className="border-t p-4 md:p-6 flex gap-3 justify-end shrink-0 bg-background">
            <Button type="button" variant="outline" onClick={onClose}>
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
