"use client"

import CodeMirror from "@uiw/react-codemirror"
import { EditorView } from "@codemirror/view"
import { useTheme } from "next-themes"
import { catppuccinLatte, catppuccinMocha } from "@catppuccin/codemirror"
import { chordProExtensions } from "../utils/chordpro-lang"

interface Props {
  content: string
  onChange?(value: string): void
}

const editorStyle = EditorView.theme({
  "&": {
    fontSize: "16px",
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace"
  },
  ".cm-line": {
    lineHeight: "1.6"
  }
})

// Extensions are created once at module level — they don't depend on runtime state.
const extensions = [...chordProExtensions(), EditorView.lineWrapping, editorStyle]

export default function SongEditorImpl({ content, onChange }: Props) {
  const { resolvedTheme } = useTheme()

  return (
    <CodeMirror
      value={content}
      height="600px"
      theme={resolvedTheme === "dark" ? catppuccinMocha : catppuccinLatte}
      extensions={extensions}
      onChange={(value) => onChange?.(value)}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
        autocompletion: false
      }}
      data-cy="song-editor"
    />
  )
}
