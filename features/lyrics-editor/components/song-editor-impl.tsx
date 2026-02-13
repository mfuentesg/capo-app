"use client"

import Editor from "@monaco-editor/react"
import { useTheme } from "next-themes"

interface Props {
  content: string
  onChange?(value: string): void
}

export default function SongEditorImpl({ content, onChange }: Props) {
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
