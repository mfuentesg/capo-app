"use client"

import { useMemo } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { EditorView } from "@codemirror/view"
import { useTheme } from "next-themes"
import { catppuccinLatte, catppuccinMocha } from "@catppuccin/codemirror"
import { toast } from "sonner"
import { chordProExtensions } from "../utils/chordpro-lang"
import { pasteConvertExtension } from "../utils/paste-convert-extension"
import { useTranslation } from "@/hooks/use-translation"

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

export default function SongEditorImpl({ content, onChange }: Props) {
  const { resolvedTheme } = useTheme()
  const { t } = useTranslation()

  const extensions = useMemo(
    () => [
      ...chordProExtensions(),
      EditorView.lineWrapping,
      editorStyle,
      pasteConvertExtension({
        onConversion: () => toast.success(t.editor.pasteConverted)
      })
    ],
    [t.editor.pasteConverted]
  )

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
