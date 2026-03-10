import { Skeleton } from "@/components/ui/skeleton"

export default function SongLyricsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header bar */}
      <div className="sticky top-0 z-10 border-b bg-background">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
            <div className="flex flex-1 min-w-0 items-center gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Lyrics content */}
      <div className="container mx-auto px-4 py-6 space-y-3">
        {["w-3/4", "w-full", "w-1/2", "w-2/3", "w-4/5", "w-full", "w-3/5", "w-full", "w-2/3", "w-1/2", "w-4/5", "w-3/4"].map(
          (w, i) => (
            <Skeleton key={i} className={`h-4 ${w}`} />
          )
        )}
      </div>
    </div>
  )
}
