import { Skeleton } from "@/components/ui/skeleton"

export default function TeamDetailLoading() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="sm:ml-auto">
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>

        {/* Members section */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-7 rounded-full" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md border p-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-lg border border-destructive/20 bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-24" />
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}
