"use client"

import CodeMirror from "@uiw/react-codemirror"
import { EditorView, ViewUpdate } from "@codemirror/view"
import { Fira_Code } from "next/font/google"
import dynamic from "next/dynamic"
import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

const font = Fira_Code({
  subsets: ["latin"],
  weight: ["400"]
})

const theme = EditorView.theme({
  "&": {
    minHeight: "600px"
  },
  ".cm-line": {
    fontSize: "16px",
    lineHeight: "26px"
  },
  "&.cm-focused": {
    outline: 0
  },
  ".cm-gutters": {
    border: "none",
    backgroundColor: "#fff"
  },
  ".cm-lineNumbers .cm-gutterElement:not(:empty)": {
    marginTop: "0",
    paddingRight: "10px",
    paddingLeft: "10px",
    lineHeight: "26px"
  },
  ".cm-content": font.style,
  ".cm-selectionMatch": {
    backgroundColor: "#bdf4e0",
    borderRadius: "5px",
    fontWeight: "bold"
  }
})

interface Props {
  content: string
  onChange?(value: string, viewUpdate: ViewUpdate): void
}

export function SongEditor({ content, onChange }: Props) {
  return (
    <CodeMirror
      value={content}
      onChange={onChange}
      theme={theme}
      data-cy="song-editor"
      basicSetup={{
        foldGutter: false
      }}
      extensions={[EditorView.lineWrapping]}
    />
  )
}

const LazyLoader = () => (
  <div className="flex flex-col p-4 space-y-2">
    <Skeleton className="w-3/4 h-3" />
    <Skeleton className="w-full h-3" />
    <Skeleton className="w-1/2 h-3" />
    <Skeleton className="w-3/4 h-3" />
    <Skeleton className="w-1/2 h-3" />
    <Skeleton className="w-full h-3" />
    <Skeleton className="w-3/4 h-3" />
  </div>
)

export const LazySongEditor = dynamic(() => Promise.resolve(SongEditor), {
  loading: () => <LazyLoader />
})
