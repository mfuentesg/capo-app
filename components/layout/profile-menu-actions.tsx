"use client"

import Link from "next/link"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Mail, LogOut, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
        <DropdownMenuItem disabled className="flex items-center gap-2 opacity-60 cursor-not-allowed">
          <Settings className="h-4 w-4" />
          <span>{t.nav.settings}</span>
          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-4">
            {t.common.comingSoon}
          </Badge>
        </DropdownMenuItem>
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
