"use client"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
import { OptimizedLogo } from "@/components/optimized-logo"
import { Menu } from "lucide-react"
import { NavLinks } from "@/components/layout/nav-links"
import { useLocale } from "@/features/settings"
import { Music, ListMusic, Users } from "lucide-react"

interface MobileNavDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNavDrawer({ isOpen, onOpenChange }: MobileNavDrawerProps) {
  const { t } = useLocale()

  const navItems = [
    { title: t.nav.songs, href: "/dashboard/songs", icon: Music },
    { title: t.nav.playlists, href: "/dashboard/playlists", icon: ListMusic },
    { title: t.nav.teams, href: "/dashboard/teams", icon: Users }
  ]

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="left">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t.common.toggleMenu}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-64">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <OptimizedLogo
              name="capo-text"
              alt={t.common.capoLogo}
              width={80}
              height={27}
              className="dark:invert"
            />
          </DrawerTitle>
        </DrawerHeader>
        <nav className="mt-8 flex flex-col gap-2">
          <NavLinks items={navItems} variant="vertical" onItemClick={() => onOpenChange(false)} />
        </nav>
      </DrawerContent>
    </Drawer>
  )
}
