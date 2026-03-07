"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { LoginForm } from "@/features/auth"

export function SignInDialog({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [manualOpen, setManualOpen] = useState(false)
  const [dismissedError, setDismissedError] = useState<string | null>(null)

  const currentError = searchParams.get("error")
  // Open when manually triggered OR when there's an unacknowledged auth error in the URL
  const open = manualOpen || (!!currentError && currentError !== dismissedError)

  const handleOpenChange = (isOpen: boolean) => {
    setManualOpen(isOpen)
    if (!isOpen && currentError) {
      setDismissedError(currentError)
      router.replace("/")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <LoginForm showLogo={false} />
      </DialogContent>
    </Dialog>
  )
}
