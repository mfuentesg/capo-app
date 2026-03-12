import { Skeleton } from "@/components/ui/skeleton"

export default function PlaylistsLoading() {
  return (
    <div className="h-[calc(100dvh-4rem)] flex bg-background">
      {/* Left panel — list */}
      <div className="w-full md:w-[35%] min-w-0 flex flex-col border-r">
        <div className="border-b p-4 lg:p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-5 w-7 rounded-full" />
            </div>
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden p-2 space-y-0.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md p-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — detail placeholder */}
      <div className="hidden md:flex flex-1 bg-muted/30" />
    </div>
  )
}
