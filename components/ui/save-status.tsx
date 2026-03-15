"use client"

import { useEffect, useState } from "react"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import type { AutoSaveStatus } from "@/hooks/use-auto-save"

interface SaveStatusProps {
  status: AutoSaveStatus
  className?: string
}

export function SaveStatus({ status, className }: SaveStatusProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  // Fade out "Saved" after 2 s
  useEffect(() => {
    if (status === "saved") {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(timer)
    }
    if (status === "pending" || status === "saving" || status === "error") {
      setVisible(true)
    }
  }, [status])

  if (status === "idle" || (status === "saved" && !visible)) {
    return null
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs transition-opacity",
        status === "saved" && "text-muted-foreground",
        status === "error" && "text-destructive",
        (status === "pending" || status === "saving") && "text-muted-foreground",
        className
      )}
    >
      {(status === "pending" || status === "saving") && (
        <Loader2 className="h-3 w-3 animate-spin" />
      )}
      {status === "saved" && <Check className="h-3 w-3" />}
      {status === "error" && <AlertCircle className="h-3 w-3" />}

      {(status === "pending" || status === "saving") && t.common.saving}
      {status === "saved" && t.common.saved}
      {status === "error" && t.common.saveFailed}
    </span>
  )
}
