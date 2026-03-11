import { Skeleton } from "@/components/ui/skeleton"

export default function SharedPlaylistLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-6">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1.5">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-72" />
              <div className="flex items-center gap-3 pt-0.5">
                <Skeleton className="h-3.5 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 shrink-0" />
          </div>
        </div>

        {/* Songs list */}
        <div className="divide-y rounded-xl border bg-card overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-3.5 w-4 shrink-0" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
