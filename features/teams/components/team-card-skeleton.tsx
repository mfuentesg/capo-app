"use client"

import { Card, CardHeader } from "@/components/ui/card"

export function TeamCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-3 w-48 bg-muted rounded mt-2" />
      </CardHeader>
    </Card>
  )
}
