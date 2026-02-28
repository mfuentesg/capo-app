import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const loadSongEditor = () => import("./song-editor-impl")

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

export function preloadSongEditor() {
  void loadSongEditor()
}

export const LazySongEditor = dynamic(loadSongEditor, {
  ssr: false,
  loading: () => <EditorLoadingSkeleton />
})
