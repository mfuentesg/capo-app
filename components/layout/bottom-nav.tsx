"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale } from "@/features/settings"
import { Home, Music, ListMusic } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const { t } = useLocale()
  const pathname = usePathname()

  const navItems = [
    { title: t.nav?.home || "Home", href: "/dashboard", icon: Home },
    { title: t.nav?.songs || "Songs", href: "/dashboard/songs", icon: Music },
    { title: t.nav?.playlists || "Playlists", href: "/dashboard/playlists", icon: ListMusic },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground transition-colors hover:text-foreground",
              isActive && "text-primary hover:text-primary"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
            <span className="text-[10px] font-medium">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
