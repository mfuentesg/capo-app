"use client"

import { CircleUserRound } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/features/auth"
import { useLocale } from "@/features/settings"
import { getInitials } from "@/lib/utils"

export function ProfileSettings() {
  const { t } = useLocale()
  const { data: user } = useUser()

  const displayName = user?.displayName || user?.fullName || user?.email || "—"
  const initials = getInitials(displayName)

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{t.settings.profile}</h2>
        <p className="text-sm text-muted-foreground">{t.settings.profileDescription}</p>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 shrink-0">
          <AvatarImage src={user?.avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-primary/10 text-lg font-semibold">
            {initials || <CircleUserRound className="h-8 w-8 text-muted-foreground" />}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 space-y-1">
          <p className="truncate font-semibold">{displayName}</p>
          {user?.email && (
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          )}
          <Badge variant="secondary" className="text-xs">
            {t.settings.connectedViaGoogle}
          </Badge>
        </div>
      </div>
    </section>
  )
}
