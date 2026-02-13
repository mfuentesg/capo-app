import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

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

export const LazySongEditor = dynamic(() => import("./song-editor-impl"), {
  ssr: false,
  loading: () => <EditorLoadingSkeleton />
})
