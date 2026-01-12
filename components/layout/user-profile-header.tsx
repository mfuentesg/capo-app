"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeftRight, CircleUserRound } from "lucide-react"
import { useUser } from "@/features/auth"

export function UserProfileHeader() {
  const { data: user } = useUser()

  return (
    <div className="p-3 border-b">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatarUrl} alt={user?.displayName || "User"} />
          <AvatarFallback className="bg-primary/10">
            <CircleUserRound className="h-6 w-6 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate">
              {user?.displayName || user?.email || "User"}
            </p>
            {user?.fullName && user.fullName !== user?.displayName && (
              <p className="text-xs text-muted-foreground truncate">{user.fullName}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
        </div>
        <ArrowLeftRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </div>
  )
}
