"use client"

import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror"
import { EditorView } from "@codemirror/view"
import { useTheme } from "next-themes"
import { catppuccinLatte, catppuccinMocha } from "@catppuccin/codemirror"
import { chordProExtensions } from "../utils/chordpro-lang"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Music, AlignLeft, MessageSquare, GripHorizontal } from "lucide-react"
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

// Extensions are created once at module level — they don't depend on runtime state.
const extensions = [...chordProExtensions(), EditorView.lineWrapping, editorStyle]

export default function SongEditorImpl({ content, onChange }: Props) {
  const { resolvedTheme } = useTheme()
  const { t } = useTranslation()
  const editorRef = useRef<ReactCodeMirrorRef>(null)

  const insertBlock = (label: string) => {
    if (editorRef.current?.view) {
      const view = editorRef.current.view
      const selection = view.state.selection.main
      const textToInsert = `{start_of_${label}}\n\n{end_of_${label}}\n`
      view.dispatch({
        changes: { from: selection.from, to: selection.to, insert: textToInsert },
        selection: { anchor: selection.from + `{start_of_${label}}\n`.length }
      })
      view.focus()
    }
  }

  const insertComment = () => {
    if (editorRef.current?.view) {
      const view = editorRef.current.view
      const selection = view.state.selection.main
      view.dispatch({
        changes: { from: selection.from, to: selection.to, insert: `{comment: }` },
        selection: { anchor: selection.from + `{comment: `.length }
      })
      view.focus()
    }
  }

  const wrapInBrackets = () => {
    if (editorRef.current?.view) {
      const view = editorRef.current.view
      const selection = view.state.selection.main
      if (selection.from !== selection.to) {
        const selectedText = view.state.sliceDoc(selection.from, selection.to)
        view.dispatch({
          changes: { from: selection.from, to: selection.to, insert: `[${selectedText}]` },
          selection: { anchor: selection.to + 2 }
        })
      } else {
        view.dispatch({
          changes: { from: selection.from, insert: `[]` },
          selection: { anchor: selection.from + 1 }
        })
      }
      view.focus()
    }
  }

  return (
    <div className="flex flex-col border-b rounded-t-lg bg-card overflow-hidden">
      <div className="flex items-center gap-1.5 p-2 bg-muted/30 border-b overflow-x-auto scrollbar-hide">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={wrapInBrackets} className="h-8 gap-1.5 text-xs font-semibold px-2">
                <Music className="h-3.5 w-3.5" />
                {t.songs.editor.chordPlaceholder}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.songs.editor.insertChordBrackets}</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <Button variant="ghost" size="sm" onClick={() => insertBlock("verse")} className="h-8 text-xs px-2">
            <AlignLeft className="h-3.5 w-3.5 mr-1.5" />
            {t.songSections?.verse || "Verse"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertBlock("chorus")} className="h-8 text-xs px-2">
            <AlignLeft className="h-3.5 w-3.5 mr-1.5" />
            {t.songSections?.chorus || "Chorus"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertBlock("bridge")} className="h-8 text-xs px-2">
            <AlignLeft className="h-3.5 w-3.5 mr-1.5" />
            {t.songSections?.bridge || "Bridge"}
          </Button>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <Button variant="ghost" size="sm" onClick={() => insertBlock("tab")} className="h-8 text-xs px-2">
            <GripHorizontal className="h-3.5 w-3.5 mr-1.5" />
            {t.songSections?.tab || "Tab"}
          </Button>

          <Button variant="ghost" size="sm" onClick={insertComment} className="h-8 text-xs px-2">
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            {t.songs.editor.comment}
          </Button>
        </TooltipProvider>
      </div>
      <CodeMirror
        ref={editorRef}
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
    </div>
  )
}
