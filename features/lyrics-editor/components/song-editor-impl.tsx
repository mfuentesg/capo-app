"use client"

import { useEffect } from "react"
import Editor from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { useIsMobile } from "@/hooks/use-mobile"

interface Props {
  content: string
  onChange?(value: string): void
}

export default function SongEditorImpl({ content, onChange }: Props) {
  const { theme: currentTheme } = useTheme()
  const monacoTheme = currentTheme === "dark" ? "vs-dark" : "vs"
  const isMobile = useIsMobile()

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return

    // Monaco Editor fires "ERR Canceled: Canceled" when its internal async
    // model-loading tasks are aborted on component unmount (e.g. during
    // React Strict Mode double-invoke or fast navigation). The error is
    // harmless — Monaco handles the cancellation gracefully — but it pollutes
    // the dev console. Turbopack makes it worse, which is why pnpm dev uses
    // webpack instead. Suppress only this specific message so real errors
    // remain visible.
    const originalConsoleError = console.error
    console.error = (...args: unknown[]) => {
      // Monaco's CancellationError: name="CancellationError", message="Canceled".
      // The browser renders it as "[  ERR Canceled: Canceled]" but arg.message is
      // just "Canceled", so we must also match on the error name.
      const hasCanceledMessage = args.some(
        (arg) =>
          (typeof arg === "string" && arg.includes("ERR Canceled")) ||
          (arg instanceof Error &&
            (arg.name === "CancellationError" || arg.message.includes("ERR Canceled")))
      )

      if (hasCanceledMessage) return
      originalConsoleError(...args)
    }

    return () => {
      console.error = originalConsoleError
    }
  }, [])

  if (isMobile) {
    return (
      <textarea
        value={content}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full min-h-[600px] resize-y p-4 bg-background text-foreground font-mono leading-relaxed focus:outline-none"
        style={{ fontSize: 16, lineHeight: "26px" }}
        data-cy="song-editor"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    )
  }

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
