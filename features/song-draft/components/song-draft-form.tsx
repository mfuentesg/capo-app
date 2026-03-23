"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KeySelect } from "@/features/songs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Info, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import type { Song } from "@/types"
import type { AppContext } from "@/features/app-context"
import { BucketSelector, useAppContext } from "@/features/app-context"
import { useTranslation } from "@/hooks/use-translation"
import { importSongFromUrl } from "../api/actions"

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
  onChange?: (updates: Partial<Song>) => void
  autoFocus?: boolean
  selectedBucket?: AppContext | null
  onBucketChange?: (ctx: AppContext) => void
}

export function SongDraftForm({
  song,
  onClose,
  onSave,
  onChange,
  autoFocus = false,
  selectedBucket,
  onBucketChange
}: SongDraftFormProps) {
  const { t } = useTranslation()
  const { teams, context } = useAppContext()
  const userId = context?.userId ?? ""

  const [importUrl, setImportUrl] = useState("")
  const [importState, setImportState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [importError, setImportError] = useState("")
  const importedLyricsRef = useRef<string | undefined>(undefined)

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
    formState: { isValid }
  } = form

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

  const handleImport = useCallback(async () => {
    const url = importUrl.trim()
    if (!url) return
    setImportState("loading")
    setImportError("")
    importedLyricsRef.current = undefined
    try {
      const imported = await importSongFromUrl(url)
      form.setValue("title", imported.title, { shouldValidate: true })
      form.setValue("artist", imported.artist, { shouldValidate: true })
      if (imported.key) form.setValue("key", imported.key, { shouldValidate: true })
      if (imported.bpm) form.setValue("bpm", imported.bpm, { shouldValidate: true })
      importedLyricsRef.current = imported.lyrics
      setImportState("done")
    } catch (err) {
      const msg = err instanceof Error ? err.message : ""
      setImportError(
        msg === "unsupportedPlatform" ? t.songImport.unsupportedPlatform : t.songImport.fetchFailed
      )
      setImportState("error")
    }
  }, [importUrl, form, t])

  const buildSong = useCallback(
    (values: SongFormValues): Song => ({
      id: song?.id?.startsWith("preview-") ? crypto.randomUUID() : song?.id || crypto.randomUUID(),
      title: values.title,
      artist: values.artist,
      key: values.key,
      bpm: values.bpm,
      lyrics: importedLyricsRef.current
    }),
    [song?.id]
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
              {/* URL Import */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span>{t.songImport.label}</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={importUrl}
                    onChange={(e) => {
                      setImportUrl(e.target.value)
                      if (importState !== "idle") {
                        setImportState("idle")
                        importedLyricsRef.current = undefined
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleImport()
                      }
                    }}
                    placeholder={t.songImport.urlPlaceholder}
                    className="shadow-none bg-background"
                    disabled={importState === "loading"}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImport}
                    disabled={!importUrl.trim() || importState === "loading"}
                    className="shrink-0 border-primary/30 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                  >
                    {importState === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    <span className="ml-2">
                      {importState === "loading" ? t.songImport.fetching : t.songImport.fetch}
                    </span>
                  </Button>
                </div>
                {importState === "done" && (
                  <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t.songImport.lyricsImported}
                  </p>
                )}
                {importState === "error" && (
                  <p className="text-xs text-destructive">{importError}</p>
                )}
              </div>

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

              {onBucketChange !== undefined && (
                <BucketSelector
                  value={selectedBucket ?? context}
                  onChange={onBucketChange}
                  userId={userId}
                  teams={teams}
                  label={t.songs.bucket}
                />
              )}

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
