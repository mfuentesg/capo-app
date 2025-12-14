"use client"

import { Badge } from "@/components/ui/badge"

interface KeyBadgeProps {
  keyValue: string
  size?: "sm" | "md"
}

export function KeyBadge({ keyValue, size = "sm" }: KeyBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={
        size === "md"
          ? "h-9 w-9 rounded-lg flex items-center justify-center font-mono"
          : "h-7 w-7 rounded-md flex items-center justify-center font-mono text-xs"
      }
    >
      {keyValue}
    </Badge>
  )
}

export default KeyBadge
