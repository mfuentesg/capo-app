"use client"

import Link from "next/link"
import { useState } from "react"
import { OptimizedLogo } from "@/components/optimized-logo"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer"
import { NavLinks } from "@/components/layout/nav-links"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { UserProfileMenu } from "@/components/layout/user-profile-menu"
import { useLocale } from "@/features/settings"
import { Music, ListMusic } from "lucide-react"

export function Navbar() {
  const { t } = useLocale()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const navItems = [
    { title: t.nav.songs, href: "/dashboard/songs", icon: Music },
    { title: t.nav.playlists, href: "/dashboard/playlists", icon: ListMusic }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <MobileNavDrawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

        <Link href="/dashboard" className="mr-6 flex items-center lg:mr-8">
          <OptimizedLogo
            name="capo-text"
            alt={t.common.capoLogo}
            width={80}
            height={24}
            priority
            className="dark:invert"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLinks items={navItems} variant="horizontal" />
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <UserProfileMenu />
        </div>
      </div>
    </header>
  )
}
