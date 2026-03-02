"use client"

import CodeMirror from "@uiw/react-codemirror"
import { EditorView } from "@codemirror/view"
import { useTheme } from "next-themes"
import { chordProExtensions } from "../utils/chordpro-lang"

interface Props {
  content: string
  onChange?(value: string): void
}

// Extensions are created once at module level — they don't depend on runtime state.
const extensions = [...chordProExtensions(), EditorView.lineWrapping]

export default function SongEditorImpl({ content, onChange }: Props) {
  const { theme: currentTheme } = useTheme()

  return (
    <CodeMirror
      value={content}
      height="600px"
      theme={currentTheme === "dark" ? "dark" : "light"}
      extensions={extensions}
      onChange={(value) => onChange?.(value)}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
        autocompletion: false,
      }}
      data-cy="song-editor"
    />
  )
}
