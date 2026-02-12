"use client"

import Link from "next/link"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Mail, LogOut } from "lucide-react"
import { useSignOut } from "@/features/auth"
import { useLocale } from "@/features/settings"

export function ProfileMenuActions() {
  const { t } = useLocale()
  const signOut = useSignOut()

  const handleSignOut = async () => {
    await signOut.mutateAsync()
  }

  return (
    <>
      <DropdownMenuSeparator />
      <div className="p-1">
        <DropdownMenuItem asChild className="flex items-center gap-2">
          <Link href="/dashboard/invitations" onClick={(e) => e.stopPropagation()}>
            <Mail className="h-4 w-4" />
            <span>{t.nav.invitations}</span>
          </Link>
        </DropdownMenuItem>
      </div>

      <DropdownMenuSeparator />
      <div className="p-1">
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={signOut.isPending}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>{signOut.isPending ? t.common.loading || "Loading..." : t.nav.logout}</span>
        </DropdownMenuItem>
      </div>
    </>
  )
}
