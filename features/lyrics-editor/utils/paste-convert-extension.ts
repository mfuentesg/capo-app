import { EditorView } from "@codemirror/view"
import { convertToChordPro } from "./chordpro-converter"

interface PasteConvertOptions {
  onConversion?: (format: string) => void
}

export function pasteConvertExtension({ onConversion }: PasteConvertOptions = {}) {
  return EditorView.domEventHandlers({
    paste(event, view) {
      const text = event.clipboardData?.getData("text/plain")
      if (!text) return false

      const { format, output } = convertToChordPro(text)

      if (format === "chord-above-lyrics") {
        event.preventDefault()
        const { from, to } = view.state.selection.main
        view.dispatch({
          changes: { from, to, insert: output }
        })
        onConversion?.(format)
        return true
      }

      return false
    }
  })
}
