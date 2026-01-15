"use client"

import Editor from "@monaco-editor/react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  content: string
  onChange?(value: string): void
}

function SongEditorClient({ content, onChange }: Props) {
  const { theme: currentTheme } = useTheme()
  const monacoTheme = currentTheme === "dark" ? "vs-dark" : "vs"

  return (
    <Editor
      height="600px"
      language="plaintext"
      theme={monacoTheme}
      value={content}
      onChange={(value) => onChange?.(value || "")}
      options={{
        wordWrap: "on",
        minimap: { enabled: false },
        fontSize: 16,
        lineHeight: 26,
        scrollBeyondLastLine: false
      }}
      data-cy="song-editor"
    />
  )
}

export function SongEditor({ content, onChange }: Props) {
  return <SongEditorClient content={content} onChange={onChange} />
}

const EditorLoadingSkeleton = () => (
  <div className="min-h-150 rounded-lg border bg-card overflow-hidden">
    <div className="flex flex-col p-4 space-y-2">
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-1/2 h-4" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-4" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-3/4 h-4" />
    </div>
  </div>
)

export const LazySongEditor = dynamic(() => Promise.resolve(SongEditorClient), {
  ssr: false,
  loading: () => <EditorLoadingSkeleton />
})
